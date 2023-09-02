import config from "../config";
import * as mysql from "mysql";

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
  