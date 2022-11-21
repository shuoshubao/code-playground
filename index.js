const { writeFileSync } = require("fs");
const { readJsonSync, ensureFileSync, ensureDirSync, removeSync } = require("fs-extra");
const { join } = require("path");
const Koa = require("koa");
const json = require("koa-json");
const serve = require("koa-static");
const pify = require("pify");
const webpack = require("webpack");
const { sleep } = require("@nbfe/tools");
const { getWebpackConfig } = require("@nbfe/react-cli");

const Port = 3000;

const app = new Koa();

app.use(json());
app.use(serve("./dist"));

app.use(async (ctx) => {
  const fileName = "demo1";

  ensureDirSync(join(__dirname, "dist", fileName))

  /*removeSync(join(__dirname, "src", fileName, "index.js"))

  ensureFileSync(join(__dirname, "src", fileName, "index.js"));

  writeFileSync(
    join(__dirname, "src", fileName, "index.js"),
    `
    const { useState, useCallback } = React;
    const { Button } = antd

    const Test = () => {
      const [count, setCount] = useState(0);

      const handleClick = useCallback(() => {
        setCount(count + 1);
      }, [count]);

      return <Button type="primary" onClick={handleClick}>click me {count}</Button>;
    };

    ReactDOM.render(<>
      <Test />
      <Test />
    </>, document.getElementById('app'));
  `
  );*/


  const webpackConfig = getWebpackConfig()

  webpackConfig.entry = join(__dirname, "src", fileName, "index.js");
  webpackConfig.output.publicPath = `http://localhost:${Port}/${fileName}/`;
  webpackConfig.output.path = join(__dirname, "dist", fileName);

  delete webpackConfig.optimization.splitChunks;

  console.log(111)
  console.log(webpackConfig)

  try {
    console.log(22)
    await pify(webpack)(webpackConfig);
    console.log(888);
    const manifest = readJsonSync(
      join(__dirname, "dist", fileName, "manifest.json")
    );
    console.log(999);
    const { css, js } = manifest.manifest.index;
    const html = `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${fileName}</title>
        <link rel="stylesheet" href="https://file.ljcdn.com/bs/antd/4.20.0/dist/antd.min.css">
        <script src="https://file.ljcdn.com/bs/react/17.0.2/umd/react.production.min.js"></script>
        <script src="https://file.ljcdn.com/bs/react-dom/17.0.2/umd/react-dom.production.min.js"></script>
        <script src="https://file.ljcdn.com/bs/antd/4.20.0/dist/antd.min.js"></script>
      </head>
      <body>
        <div id="app"></div>
        ${js.map((v) => {
          return `<script src="${v}"></script>`;
        })}
      </body>
      </html>`;
    writeFileSync(join(__dirname, "dist", fileName, "index.html"), html);
    ctx.body = {
      manifest,
    };
  } catch (err) {
    console.log(222);
    console.log(err.stack || err);
    ctx.body = {
      code: 1,
      message: err.stack || err,
    };
  }
  // ctx.body = {}
});

app.listen(Port);
