import Error from "tderrors";
import { Express } from "express";
import { check_2fa, get_token } from "../common/authorization";
import config, { UserKey } from "../config";
import { errorcode } from "../common/authorization";
import ErrorChild from "../error";

export default async function Init_Login(
  app: Express,
  error: ErrorChild | Error
) {
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

  error.postLog('模块加载成功')
}
