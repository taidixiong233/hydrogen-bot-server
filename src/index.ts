import express, { Express } from "express";
import BodyParser from "body-parser";
import config from "./config";
import Error from "tderrors";
import * as path from "path";
import gameconfig, { Artillery } from "./gameconfig";
import { Init_help } from "./server/help";
import { Init_user } from "./server/user";
import { Init_store } from "./server/store";
import { Init_game } from "./server/game";
import { Init_stat } from "./server/stat";

export const error = new Error(path.join(__dirname, "../logs"));
const app: Express = express();

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: false }));
app.listen(config.port, () => {
  error.postLog(`http服务器启动成功`, { port: config.port });
});

//解析所有的飞机名字
export const flycraft: string[] = [];
//所有的大炮名字
export const artillery: string[] = [];

/**监听服务器启动成功事件 */
error.once("http服务器启动成功", () => {
  error.postLog(`开始加载配置文件`);

  gameconfig.forEach((v, k) => {
    if ((v as Artillery)?.暴击攻击 == undefined) {
      flycraft.push(k);
    } else {
      artillery.push(k);
    }
  });
  if (gameconfig.size === 8) {
    error.postLog("配置文件加载完毕");
  }
});

error.once("配置文件加载完毕", () => {
  error.postLog("开始加载服务");
});

error.once("开始加载服务", async () => {
  await Init_help(app, error);
  await Init_user(app, error);
  await Init_store(app, error);
  await Init_game(app, error);
  await Init_stat(app, error);
});

export default app;
