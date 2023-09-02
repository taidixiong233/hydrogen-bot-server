import express, { Express } from "express";
import BodyParser from "body-parser";
import config from "./config";
import Error from "tderrors";
import * as path from "path";
import ErrorChild from "./error";

export const error = new Error(path.join(__dirname, "../logs"));
const app: Express = express();

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: false }));
app.listen(config.port, () => {
  error.postLog(`http服务器启动成功`, { port: config.port });
});

/**监听服务器启动成功事件 */
error.once("http服务器启动成功", () => {
  error.postLog("开始加载服务");
});

import Init_Login from "./server/login";
import Init_FlightBattle from "./flight-battle";

error.once("开始加载服务", async () => {
  await Init_Login(app, new ErrorChild(error, "Login"));
  await Init_FlightBattle(app, new ErrorChild(error, "飞机大作战"));
});
