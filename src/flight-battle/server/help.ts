import ErrorChild from "../../error";
import { Express } from "express";
import * as path from "path";
import { authorization_token } from "../../common/authorization";
import config from "../../config";
import { errorcode } from "../../common/authorization";

export async function Init_help(app: Express, error: ErrorChild) {
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
