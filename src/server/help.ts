import E from "tderrors";
import { Express } from "express";
import * as path from "path";
import { check_2fa, authorization_token, get_token } from "./common";
import config from "../config";
import { UserKey } from "../config";
import { errorcode } from "./common";

export async function Init_help(app: Express, error: E) {
  /**get image of help */
  app.post("/help", async (req, res) => {
    try {
      await authorization_token(req);
      res.sendFile(path.join(__dirname, "../../assets/帮助.jpg"));
    } catch (err) {
      if (err) {
        /**这是jwt认证失败，不理会 */
        if (
          String(err) != "JsonWebTokenError: jwt malformed" &&
          String(err) != "JsonWebTokenError: invalid token"
        ) {
          error.postError(String(err));
        }
      }

      res.json({
        code: errorcode.authorization_error,
        status: "error",
        message: "鉴权失败",
      });

      return;
    }
  });

  /**用户使用动态密码进行登录获取token */
  app.post("/login", (req, res) => {
    try {
      const { useruuid, code } = req.body;
      if (typeof useruuid != "string" || typeof code != "string") {
        throw "参数错误";
      }

      if (check_2fa(code, useruuid)) {
        //密码正确
        const token = get_token(
          (config.user.get(useruuid) as UserKey).ip,
          useruuid
        );
        res.json({
          code: errorcode.success,
          status: "ok",
          token: token,
        });
        return;
      }

      res.json({
        code: errorcode.authorization_error,
        status: "error",
        message: "动态密码错误",
      });
      return;
    } catch (err) {
      if (err && err == "参数错误") {
        res.json({
          status: "error",
          message: "参数错误",
        });
        return;
      }

      error.postError(String(err));

      res.json({
        code: errorcode.authorization_error,
        status: "error",
        message: "动态密码错误",
      });
    }
  });

  /**version */
  app.post("/version", (_, res) =>
    res.json({
      version: config.version,
      code: errorcode.success,
      status: "ok",
    })
  );
  error.postLog("help模块加载完毕");
}
