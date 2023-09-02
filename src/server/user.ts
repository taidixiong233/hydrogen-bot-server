import config from "../config";
import * as mysql from "mysql";
import Error from "tderrors";
import { Express } from "express";
import { errorcode, authorization_token } from "./common";

export async function Init_user(app: Express, error: Error) {
  /**create new user in a datatable named user */
  app.post("/create_user", async (req, res) => {
    //authorization token check by request of http
    try {
      await authorization_token(req);
      const { uin } = req.body;
      try {
        if (uin == undefined || Number.isNaN(Number(uin))) {
          throw "参数错误";
        }
        const userdata = await QueryUserData(uin as number);
        //用户存在，输出用户信息即可
        res.json({
          code: errorcode.success,
          status: "ok",
          data: userdata,
        });
      } catch (err) {
        if (err && err == "参数错误") {
          res.json({
            status: "error",
            message: "参数错误",
          });
          return;
        }
        //user not has account
        //new user
        try {
          await AddUserData(uin);
          //create data of user successed
          //query and return the data of user
          //the type of uin is number

          res.json({
            code: errorcode.success,
            status: "ok",
            data: {
              QQid: 10001,
              score: 0,
              sign_Date: "Thu Jan 01 1970 00:00:00 GMT+0800 (中国标准时间)",
              dayN: 0,
              ban: 0,
            },
          });
          return;
        } catch (err) {
          //the err certain isn't error of parameter
          if (err) {
            //maybe because have error of database
            error.postError(String(err));
            res.json({
              code: errorcode.unknown_error,
              status: "error",
              message: "未知错误",
            });
            return;
          }

          //certain have error of database
          //don't return the object of err, beacuse it has privacy content
          res.json({
            code: errorcode.database_error,
            status: "error",
            message: "出于安全考虑,不会返回数据库错误的具体原因",
          });
          return;
        }
      }
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

  /**query user's data in a data table named user through uin, if user don't have data, isn't automatically create data */
  app.post("/query_user", async (req, res) => {
    try {
      await authorization_token(req);
      //begin query
      const { uin } = req.body as { uin: number };
      try {
        if (!uin || Number.isNaN(Number(uin))) {
          res.json({
            message: "参数错误",
            status: "error",
          });
          return;
        }
        const userdata = await QueryUserData(uin);

        res.json({
          code: errorcode.success,
          status: "ok",
          data: userdata,
        });
        return;
      } catch (err) {
        if (err && err == "用户没有数据") {
          res.json({
            code: errorcode.notfound,
            status: "error",
            message: "用户没有数据",
          });
          return;
        }

        //database error
        res.json({
          code: errorcode.database_error,
          status: "error",
          message: "数据库错误",
        });
        return;
      }
    } catch (err) {
      //authorization faily, if generate unknown error can return authorization faily error too
      res.json({
        code: errorcode.authorization_error,
        status: "error",
        message: "鉴权失败",
      });
      return;
    }
  });

  /**create new user's game data in a datatable named game_user_a
   * if user don't hava data that it in data table named user, isn't automatically create data and throw error
   */
  app.post("/create_game_user", async (req, res) => {
    try {
      await authorization_token(req);
      //begin query
      const { uin, type, allow, bulletN } = req.body as {
        uin: number;
        type?: number;
        allow?: number;
        bulletN?: number;
      };
      try {
        if (!uin || Number.isNaN(Number(uin))) {
          res.json({
            message: "参数错误",
            status: "error",
          });
          return;
        }
        await QueryUserData(uin);

        try {
          try {
            const game = await QueryGameUserData(uin);
            res.json({
              code: errorcode.success,
              status: "ok",
              data: game,
            });
          } catch (err) {
            //begin create
            await AddGameUserData(uin, type, allow, bulletN);

            //successed
            res.json({
              code: errorcode.success,
              status: "ok",
              data: {
                QQid: uin,
                type: type == undefined ? 0 : Number(type),
                allow: allow == undefined ? 2 : Number(allow),
                bulletN: bulletN == undefined ? 0 : Number(bulletN),
              },
            });
            return;
          }
        } catch (err) {
          //maybe database error
          res.json({
            code: errorcode.database_error,
            status: "error",
            message: "数据库错误",
          });
          return;
        }
      } catch (err) {
        if (err && err == "用户没有数据") {
          res.json({
            code: errorcode.notfound,
            status: "error",
            message: "用户没有数据",
          });
          return;
        }

        //database error
        res.json({
          code: errorcode.database_error,
          status: "error",
          message: "数据库错误",
        });
        return;
      }
    } catch (err) {
      //authorization faily, if generate unknown error can return authorization faily error too
      res.json({
        code: errorcode.authorization_error,
        status: "error",
        message: "鉴权失败",
      });
      return;
    }
  });

  /**query data of user's game in data table named game_user_a, if user didn't have this data can throw error, isn't automatically create data*/
  app.post("/query_game_user", async (req, res) => {
    try {
      await authorization_token(req);
      //begin query
      const { uin } = req.body as { uin: number };
      try {
        if (!uin || Number.isNaN(Number(uin))) {
          res.json({
            message: "参数错误",
            status: "error",
          });
          return;
        }
        await QueryUserData(uin);
        const gamedata = await QueryGameUserData(uin);
        res.json({
          code: errorcode.success,
          status: "ok",
          data: gamedata,
        });
        return;
      } catch (err) {
        if (err && err == "用户没有数据") {
          res.json({
            code: errorcode.notfound,
            status: "error",
            message: "用户没有数据",
          });
          return;
        }

        //database error
        res.json({
          code: errorcode.database_error,
          status: "error",
          message: "数据库错误",
        });
        return;
      }
    } catch (err) {
      //authorization faily, if generate unknown error can return authorization faily error too
      res.json({
        code: errorcode.authorization_error,
        status: "error",
        message: "鉴权失败",
      });
      return;
    }
  });

  /**setting score of user's game data, if user didn't have game data can throw error, isn't automatically create data */
  app.post("/set_user_score", async (req, res) => {
    try {
      await authorization_token(req);
      //begin query
      const { uin, score } = req.body as { uin: number; score: number };
      try {
        if (
          !uin ||
          Number.isNaN(Number(uin)) ||
          !score ||
          Number.isNaN(Number(score))
        ) {
          res.json({
            message: "参数错误",
            status: "error",
          });
          return;
        }
        const userdata = await QueryUserData(uin);

        try {
          await SettingsUserCon(uin, score);

          res.json({
            code: errorcode.success,
            status: "ok",
            data: {
              ...(userdata as Omit<User, "score">),
              score: score,
            },
          });
          return;
        } catch (err) {
          //database error
          error.postError(String(err));
          res.json({
            code: errorcode.database_error,
            status: "error",
            message: "数据库错误",
          });
          return;
        }
      } catch (err) {
        if (err && err == "用户没有数据") {
          res.json({
            code: errorcode.notfound,
            status: "error",
            message: "用户没有数据",
          });
          return;
        }

        //database error
        error.postError(String(err));
        res.json({
          code: errorcode.database_error,
          status: "error",
          message: "数据库错误",
        });
        return;
      }
    } catch (err) {
      //authorization faily, if generate unknown error can return authorization faily error too
      res.json({
        code: errorcode.authorization_error,
        status: "error",
        message: "鉴权失败",
      });
      return;
    }
  });

  /**add score of user's game data, if user didn't have game data can throw error, isn't automatically create data */
  app.post("/add_user_score", async (req, res) => {
    try {
      await authorization_token(req);
      //begin query
      const { uin, score } = req.body as { uin: number; score: number };
      try {
        if (
          !uin ||
          Number.isNaN(Number(uin)) ||
          !score ||
          Number.isNaN(Number(score))
        ) {
          res.json({
            message: "参数错误",
            status: "error",
          });
          return;
        }
        const userdata = await QueryUserData(uin);

        try {
          const new_score = Number(score) + Number(userdata.score);
          await SettingsUserCon(uin, new_score);

          res.json({
            code: errorcode.success,
            status: "ok",
            data: {
              ...(userdata as Omit<User, "score">),
              score: new_score,
            },
          });
          return;
        } catch (err) {
          //database error
          error.postError(String(err));
          res.json({
            code: errorcode.database_error,
            status: "error",
            message: "数据库错误",
          });
          return;
        }
      } catch (err) {
        if (err && err == "用户没有数据") {
          res.json({
            code: errorcode.notfound,
            status: "error",
            message: "用户没有数据",
          });
          return;
        }

        //database error
        error.postError(String(err));
        res.json({
          code: errorcode.database_error,
          status: "error",
          message: "数据库错误",
        });
        return;
      }
    } catch (err) {
      //authorization faily, if generate unknown error can return authorization faily error too
      res.json({
        code: errorcode.authorization_error,
        status: "error",
        message: "鉴权失败",
      });
      return;
    }
  });

  error.postLog("user模块加载完毕");
}

/**query the data of user by uin, throw error then the user not has data */
export async function QueryUserData(uin: number): Promise<User> {
  const sql = mysql.createPool(config.database);
  return new Promise((res, rej) => {
    sql.query(
      {
        sql: `select * from user where QQid = '${uin}'`,
      },
      (err, data) => {
        sql.end();
        if (err) {
          rej(`访问数据库错误${err.message}`);
          return;
        }
        if (Array.isArray(data) && data.length > 0) {
          res(formatUserData(data[0]));
        } else {
          rej("用户没有数据");
          return;
        }
      }
    );
  });
}

/**create the data of user by uin, the user must not has data */
export async function AddUserData(
  QQid = 0,
  score = 0,
  sign_Date = "1970-01-01",
  dayN = 0,
  ban = 0
): Promise<void> {
  const sql = mysql.createPool(config.database);
  sql.query(
    {
      sql: `INSERT INTO user (QQid,score,sign_Date,dayN,ban) values ('${QQid}', '${score}', '${sign_Date}', '${dayN}', '${ban}')`,
    },
    (err) => {
      sql.end();
      if (err) {
        return new Promise((_, rej) => rej(err));
      } else {
        return new Promise<void>((res) => res());
      }
    }
  );
}

/**format data of user and return data that use interface named User */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatUserData(data: any): User {
  const ret: User = {
    QQid: data?.QQid == undefined ? 0 : Number(data.QQid),
    score: data?.score == undefined ? 0 : Number(data.score),
    sign_Date: data?.sign_Date == undefined ? "" : String(data.sign_Date),
    dayN: data?.dayN == undefined ? 0 : Number(data.dayN),
    ban: data?.ban == undefined ? 0 : Number(data.ban),
  };
  return ret;
}

/**query data that game of user by uin, if user isn't has data can throw error, isn't automatically create data */
export async function QueryGameUserData(uin: number): Promise<GameUser> {
  const sql = mysql.createPool(config.database);
  return new Promise((res, rej) => {
    sql.query(
      {
        sql: `select * from game_user_a where QQid = '${uin}'`,
      },
      (err, data) => {
        sql.end();
        if (err) {
          rej(`访问数据库错误${err.message}`);
        }
        if (Array.isArray(data) && data.length > 0) {
          res(formatGameUserData(data[0]));
        } else {
          rej("用户没有数据");
        }
      }
    );
  });
}

/**create game of user of game by uin */
export async function AddGameUserData(
  QQid: number,
  type: number = 0,
  allow: number = 2,
  bulletN: number = 0
): Promise<void> {
  return new Promise((res, rej) => {
    const sql = mysql.createPool(config.database);
    sql.query(
      {
        sql: `insert into game_user_a (QQid,type,allow,bulletN) values ('${QQid}','${type}','${allow}','${bulletN}')`,
      },
      (err) => {
        sql.end();
        if (err) {
          rej(err);
        } else {
          res();
        }
      }
    );
  });
}

/**format data that game of user and return data that use interface named GameUser */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatGameUserData(data: any): GameUser {
  const ret: GameUser = {
    QQid: data?.QQid == undefined ? 0 : Number(data.QQid),
    type: data?.type == undefined ? 0 : Number(data.type),
    allow: data?.allow == undefined ? 1 : Number(data.allow),
    bulletN: data?.bulletN == undefined ? 0 : Number(data.bulletN),
    timeout: data?.timeout == undefined ? undefined : Number(data.timeout),
  };
  return ret;
}

/**settings content that data of user's game  */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function SettingsGameUserCon(
  uin: number,
  type: number,
  allow: number,
  bulletN: number,
  timeout?: number
): Promise<void> {
  return new Promise<void>((res, rej) => {
    const sql = mysql.createPool(config.database);
    sql.query(
      {
        sql:
          timeout == undefined
            ? `update game_user_a set type='${type}', allow='${allow}', bulletN='${bulletN}' where QQid='${uin}'`
            : `update game_user_a set type='${type}', allow='${allow}', bulletN='${bulletN}', timeout='${timeout}' where QQid='${uin}'`,
      },
      (err) => {
        if (err) {
          rej(err);
        } else {
          res();
        }
      }
    );
  });
}

/**settings content of user's data */
export async function SettingsUserCon(
  uin: number,
  score: number
): Promise<void> {
  return new Promise<void>((res, rej) => {
    const sql = mysql.createPool(config.database);
    sql.query(
      {
        sql: `update user set score='${score}' where QQid='${uin}'`,
      },
      (err) => {
        if (err) {
          rej(err);
        } else {
          res();
        }
      }
    );
  });
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sleep = async (ms: number): Promise<void> => {
  return new Promise<void>((res) => setTimeout(res, ms));
};

export interface User {
  QQid: number;
  score: number;
  sign_Date: string;
  dayN: number;
  ban: number;
}

export interface GameUser {
  QQid: number;
  type: number;
  allow: number;
  bulletN: number;
  timeout?: number;
}
