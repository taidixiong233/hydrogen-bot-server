import { Express } from "express";
import gameconfig, { Artillery } from "./gameconfig";
import { Init_help } from "./server/help";
import { Init_user } from "./server/user";
import { Init_store } from "./server/store";
import { Init_game } from "./server/game";
import { Init_stat } from "./server/stat";
import ErrorChild from "../error";

//解析所有的飞机名字
export const flycraft: string[] = [];
//所有的大炮名字
export const artillery: string[] = [];

export default async function (
  app: Express,
  error: ErrorChild,
  BaseUrl: string
): Promise<void> {
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
    await Init_help(app, error, BaseUrl);
    await Init_user(app, error, BaseUrl);
    await Init_store(app, error, BaseUrl);
    await Init_game(app, error, BaseUrl);
    await Init_stat(app, error, BaseUrl);
  }
}
