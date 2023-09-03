import { GetScoreFinkingPng } from "./scoreList";
import * as fs from "fs";

import Error from "tderrors";
import { Express } from "express";
import { errorcode } from "../../common/authorization";
import ErrorChild from "../../error";
import { authorization_token } from "../../common/authorization";
import { QuerySomeUserData } from "../../common/user";
import { join } from "path";

export default async function Init_Fink(
  app: Express,
  error: ErrorChild | Error
) {
  /**用户使用动态密码进行登录获取token */
  app.post(`/score_finking`, async (req, res) => {
    //authorization token check by request of http
    try {
      await authorization_token(req);
      const data = await QuerySomeUserData();
      const image = await GetScoreFinkingPng(data);
      if (!fs.existsSync(join(__dirname, "./tmp"))) {
        fs.mkdirSync(join(__dirname, "./tmp"));
      }

      const time = new Date().getTime();
      fs.writeFileSync(join(__dirname, "./tmp", `${time}.png`), image);

      res.sendFile(join(__dirname, "./tmp", `${time}.png`));

      return setTimeout(() => {
        fs.unlinkSync(join(__dirname, "./tmp", `${time}.png`));
      }, 2000);
    } catch (err) {
      if (err && String(err) != "JsonWebTokenError: invalid token") {
        //unknown error
        error.postError(String(err));
      }

      //authorization faily, if generate unknown error can return authorization faily error too
      res.json({
        code: errorcode.authorization_error,
        status: "error",
        message: "鉴权失败",
      });
      return;
    }
  });

  error.postLog("模块加载成功");
}
