import ErrorChild from "../../error";
import { Express } from "express";
import { authorization_token } from "../../common/authorization";
import { errorcode } from "../../common/authorization";
import * as mysql from "mysql";
import config from "../../config";

export async function Init_stat(app: Express, error: ErrorChild) {
  /** statistics data*/
  app.post("/stat", async (req, res) => {
    try {
      await authorization_token(req);
      try {
        const ret: Stat = {
          pilot: await GetNumber("pilot"),
          artillery: await GetNumber("artillery"),
          user: await GetNumber("user"),
          time: new Date().getTime(),
          gameuser: await GetNumber("gameuser"),
          sky_flying: await GetNumber("sky_flying"),
          all_score: await GetAllNumber("score"),
          all_bullet: await GetAllNumber("bulletN"),
        };
        res.json({
          code: errorcode.success,
          status: "ok",
          data: ret,
        });
        return;
      } catch (err) {
        error.postError(String(err));
        //unknown error
        res.json({
          code: errorcode.unknown_error,
          status: "error",
          message: "未知错误",
        });
        return;
      }
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

  error.postLog("stat模块加载完毕");
}

async function GetNumber(
  mode: "pilot" | "artillery" | "user" | "gameuser" | "sky_flying"
): Promise<number> {
  const sqlcmd = {
    pilot: `select COUNT(*) from game_user_a where allow != '3';`,
    artillery: `select COUNT(*) from game_user_a where allow = '3';`,
    user: `select COUNT(*) from user;`,
    gameuser: `select COUNT(*) from game_user_a;`,
    sky_flying: `select COUNT(*) from game_a_sky;`,
  };
  return new Promise((res, rej) => {
    const sql = mysql.createPool(config.database);
    sql.query(
      {
        sql: sqlcmd[mode],
      },
      (err, data) => {
        sql.end();
        if (err) {
          rej(err);
          return;
        }

        if (
          !Array.isArray(data) ||
          data.length <= 0 ||
          data[0]["COUNT(*)"] == undefined
        ) {
          rej(data);
          return;
        }

        res(data[0]["COUNT(*)"]);
      }
    );
  });
}

async function GetAllNumber(mode: "score" | "bulletN"): Promise<number> {
  const sqlcmd = {
    score: `select sum(score) from user;`,
    bulletN: `select sum(bulletN) from game_user_a;`,
  };
  return new Promise((res, rej) => {
    const sql = mysql.createPool(config.database);
    sql.query(
      {
        sql: sqlcmd[mode],
      },
      (err, data) => {
        sql.end();
        if (err) {
          rej(err);
          return;
        }

        if (
          !Array.isArray(data) ||
          data.length <= 0 ||
          data[0][`sum(${mode})`] == undefined
        ) {
          rej(data);
          return;
        }

        res(data[0][`sum(${mode})`]);
      }
    );
  });
}

export interface Stat {
  /**用户总数 */
  user: number;
  /**数据统计时间 */
  time: number;
  /**游戏账户数量 */
  gameuser: number;
  /**正在飞行的飞机数量 */
  sky_flying: number;
  /**飞行员数量 */
  pilot: number;
  /**炮兵数量 */
  artillery: number;
  /**总积分数量 */
  all_score: number;
  /**炮弹总数 */
  all_bullet: number;
}
