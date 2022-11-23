const { readFileSync, writeFileSync } = require('fs')
const { ensureFileSync, readJsonSync } = require('fs-extra')
const { join } = require('path')
const execa = require('execa')
const pify = require('pify')
const webpack = require('webpack')
const prettier = require('prettier')
const less = require('less')
const sass = require('sass')
const { minify: minifyCss } = require('csso')
const md5 = require('md5')
const { flatten, difference } = require('lodash')
const { v4: uuidv4 } = require('uuid')
const { parse: babelParse } = require('@babel/parser')
const { getWebpackConfig } = require('@nbfe/react-cli')
const { generateDocument } = require('@nbfe/js2html')

const getPresetPkgs = () => {
  const { dependencies, devDependencies } = require('../package.json')
  const { configureWebpack } = require('../react.config')(false)

  return flatten([Object.keys(dependencies), Object.keys(devDependencies), Object.keys(configureWebpack.externals)])
}

const getImportPkgs = code => {
  const ast = babelParse(code, {
    sourceType: 'module',
    plugins: ['jsx']
  })

  const pkgs = ast.program.body.filter(v => v.type === 'ImportDeclaration').map(v => v.source.value)

  return difference(pkgs, getPresetPkgs())
}

const intallPkgs = code => {
  const timestap = Date.now()
  const pkgs = getImportPkgs(code)
  if (pkgs.length) {
    execa.sync('npm', ['i', ...pkgs])
    return Date.now() - timestap
  }
  return 0
}

const injectPublicPath = (assets, publicPath) => {
  return Object.entries(assets).reduce((prev, [k, v]) => {
    prev[k] = v.map(v2 => {
      if (v2.startsWith('http')) {
        return v2.replace('antd.dark.min.css', 'antd.min.css')
      }
      return [publicPath, v2].join('')
    })
    return prev
  }, {})
}

const validateCode = async params => {
  const { styleLanguage, styleCode, scriptCode } = params
  try {
    babelParse(scriptCode, {
      sourceType: 'module',
      plugins: ['jsx']
    })
  } catch (e) {
    return {
      code: 1,
      message: e.message
    }
  }
  return {
    code: 0
  }
}

const getCssCode = async (styleLanguage, styleCode) => {
  let code
  if (['css', 'less'].includes(styleLanguage)) {
    const { css } = await pify(less.render)(styleCode)
    code = css
  }
  if (styleLanguage === 'sass') {
    code = sass.compileString(styleCode)
  }
  return minifyCss(code).css
}

module.exports = async (req, res) => {
  const { filename, styleLanguage, styleCode, scriptLanguage, scriptCode } = req.body
  const validateRes = await validateCode(req.body)
  if (validateRes.code) {
    return validateRes
  }
  const timestap = Date.now()
  const uuid = md5(filename)
  const content = scriptCode
  const webpackConfig = getWebpackConfig(false)
  const indexPath = join(__dirname, '../cache-src', `${uuid}.js`)
  ensureFileSync(indexPath)
  writeFileSync(indexPath, content)
  webpackConfig.entry = {
    index: indexPath
  }
  webpackConfig.output.path = join(__dirname, '../dist', uuid)
  const publicPath = `http://localhost:8080/${uuid}/`
  webpackConfig.output.publicPath = publicPath
  delete webpackConfig.optimization.splitChunks
  try {
    const installPkgsTime = intallPkgs(scriptCode)
    await pify(webpack)(webpackConfig)
    const webpackTime = Date.now() - timestap
    const { manifest } = readJsonSync(join(webpackConfig.output.path, 'manifest.json'))
    const { css, js } = injectPublicPath(manifest.index, publicPath)
    const html = generateDocument({
      title: uuid,
      style: [
        ...css,
        {
          text: await getCssCode(styleLanguage, styleCode)
        }
      ],
      bodyHtml: ['<div id="app"></div>'],
      script: js.map(v => {
        return {
          src: v
        }
      })
    })
    writeFileSync(
      join(webpackConfig.output.path, 'index.html'),
      prettier.format(html, {
        parser: 'html',
        printWidth: 120
      })
    )
    return {
      code: 0,
      timestap: Date.now(),
      webpackTime,
      installPkgsTime,
      filePath: publicPath
    }
  } catch (e) {
    console.log(e)
    return {
      code: 1,
      message: e.message
    }
  }
}
