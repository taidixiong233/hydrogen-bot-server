import ErrorChild from "../../error";
import { Express } from "express";
import { authorization_token } from "../../common/authorization";
import { errorcode } from "../../common/authorization";
import {
  GameUser,
  QueryGameUserData,
  QueryUserData,
  SettingsGameUserCon,
  SettingsUserCon,
  User,
} from "../../common/user";
import * as mysql from "mysql";
import parameter, { Aircraft, Artillery } from "../gameconfig";
import config from "../../config";

export async function Init_game(app: Express, error: ErrorChild) {
  /**pilot takeoff, if user isn't pilot can throw error */
  app.post("/game_takeoff", async (req, res) => {
    try {
      await authorization_token(req);

      try {
        const { uin } = req.body as { uin: number };
        if (!uin || Number.isNaN(Number(uin))) {
          res.json({
            message: "参数错误",
            status: "error",
          });
          return;
        }

        const user = await QueryUserData(uin);
        const game = await QueryGameUserData(uin);

        try {
          await takeoff(uin, user, game);

          res.json({
            code: errorcode.success,
            status: "ok",
          });
          return;
        } catch (err) {
          if (err && typeof err == "string") {
            switch (err) {
              case "用户是炮兵":
                res.json({
                  code: errorcode.career_mismatch,
                  status: "error",
                  message: "用户是炮兵",
                });
                return;
              case "飞机正在飞行":
                res.json({
                  code: errorcode.flycraft_flying,
                  status: "error",
                  message: "飞机正在飞行",
                });
                return;
              case "用户没有飞机":
                res.json({
                  code: errorcode.user_not_have_flycraft,
                  status: "error",
                  message: "用户没有飞机",
                });
                return;
              case "用户的飞行许可证被吊销":
                res.json({
                  code: errorcode.revocation_flight_permit,
                  status: "error",
                  message: "用户的飞行许可证被吊销",
                });
                return;
              case "用户没有飞行许可证":
                res.json({
                  code: errorcode.user_isnot_flight_permit,
                  status: "error",
                  message: "用户没有飞行许可证",
                });
                return;
              case "数据库数据无法识别":
                res.json({
                  code: errorcode.database_error_parameter_error,
                  status: "error",
                  message:
                    "数据库数据无法识别 at Promise; at takeoff<function>; at game.ts;",
                });
                return;
            }
          }
          if (err) {
            error.postError(String(err));
          }
          res.json({
            code: errorcode.unknown_error,
            status: "error",
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
      res.json({
        code: errorcode.authorization_error,
        status: "error",
        message: "鉴权失败",
      });

      return;
    }
  });

  app.post("/game_landing", async (req, res) => {
    try {
      await authorization_token(req);

      try {
        const { uin } = req.body as { uin: number };
        if (!uin || Number.isNaN(Number(uin))) {
          res.json({
            message: "参数错误",
            status: "error",
          });
          return;
        }

        const user = await QueryUserData(uin);
        const game = await QueryGameUserData(uin);

        try {
          const ret = await landing(uin, user, game);

          res.json({
            code: errorcode.success,
            status: "ok",
            data: ret,
          });
          return;
        } catch (err) {
          if (err && typeof err == "string") {
            switch (err) {
              case "用户是炮兵":
                res.json({
                  code: errorcode.career_mismatch,
                  status: "error",
                  message: "用户是炮兵",
                });
                return;
              case "飞机没有起飞":
                res.json({
                  code: errorcode.flycraft_isnot_flying,
                  status: "error",
                  message: "飞机没有起飞",
                });
                return;
              case "数据库字段错误,timeout记录的时间大于本地时间":
                res.json({
                  code: errorcode.database_error_parameter_error,
                  status: "error",
                  message: "数据库字段错误,timeout记录的时间大于本地时间",
                });
                return;
            }
          }
          if (err) {
            error.postError(String(err));
          }
          res.json({
            code: errorcode.unknown_error,
            status: "error",
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
      res.json({
        code: errorcode.authorization_error,
        status: "error",
        message: "鉴权失败",
      });

      return;
    }
  });

  app.post("/game_transmit", async (req, res) => {
    try {
      await authorization_token(req);

      try {
        const { uin } = req.body as { uin: number };
        if (!uin || Number.isNaN(Number(uin))) {
          res.json({
            message: "参数错误",
            status: "error",
          });
          return;
        }

        const user = await QueryUserData(uin);
        const game = await QueryGameUserData(uin);

        try {
          const ret = await transmit(uin, user, game);

          res.json({
            code: errorcode.success,
            status: "ok",
            data: ret,
          });
          return;
        } catch (err) {
          if (err && typeof err == "string") {
            switch (err) {
              case "飞行员不能打飞机":
                res.json({
                  code: errorcode.career_mismatch,
                  status: "error",
                  message: "飞行员不能打飞机",
                });
                return;
              case "飞机数量过少":
                res.json({
                  code: errorcode.flying_less,
                  status: "error",
                  message: "飞机数量过少",
                });
                return;
              case "炮弹不够":
                res.json({
                  code: errorcode.buttle_less,
                  status: "error",
                  message: "炮弹不够",
                });
                return;
              case "频率过高":
                res.json({
                  code: errorcode.transmit_speed_more_timeout,
                  status: "error",
                  message: "发射的频率过快",
                });
                return;
              case "用户没有大炮":
                res.json({
                  code: errorcode.not_found_things,
                  status: "error",
                  message: "用户没有大炮",
                });
                return;
            }
          }
          if (err) {
            error.postError(String(err));
          }
          res.json({
            code: errorcode.unknown_error,
            status: "error",
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
      res.json({
        code: errorcode.authorization_error,
        status: "error",
        message: "鉴权失败",
      });

      return;
    }
  });

  error.postLog("game模块加载完毕");
}

/**takeoff */
export async function takeoff(
  uin: number,
  user?: User,
  game?: GameUser
): Promise<void> {
  try {
    if (user == undefined) {
      user = await QueryUserData(uin);
    }

    if (game == undefined) {
      game = await QueryGameUserData(uin);
    }
  } catch (err) {
    return new Promise((_, rej) => rej(err));
  }

  if (game.allow == 3) {
    //user isn't pilot
    return new Promise<void>((_, rej) => rej("用户是炮兵"));
  }

  const fly_list = await GetAllFlying(uin);

  if (fly_list.length > 0) {
    //aircraft flying
    return new Promise<void>((_, rej) => rej("飞机正在飞行"));
  }

  if (game.type == 0) {
    //user didn't have aircraft

    return new Promise<void>((_, rej) => rej("用户没有飞机"));
  }

  if (game.allow == 1) {
    return new Promise<void>((_, rej) => rej("用户的飞行许可证被吊销"));
  }

  if (game.allow === 2) {
    return new Promise<void>((_, rej) => rej("用户没有飞行许可证"));
  }

  if (game.allow === 0) {
    try {
      await CreateFlyTakeoff(uin, game.type, new Date().getTime());

      //success
      return new Promise<void>((res) => res());
    } catch (err) {
      return new Promise<void>((_, rej) => rej(err));
    }
  } else {
    return new Promise<void>((_, rej) => rej("数据库数据无法识别"));
  }
}

/**flycraft landing
 * @returns time 单位是ms
 */
export async function landing(
  uin: number,
  user?: User,
  game?: GameUser
): Promise<{ add_score: number; time: number }> {
  try {
    if (user == undefined) {
      user = await QueryUserData(uin);
    }

    if (game == undefined) {
      game = await QueryGameUserData(uin);
    }

    if (game.allow == 3) {
      //user isn't pilot
      return new Promise((_, rej) => rej("用户是炮兵"));
    }

    const fly_list = await GetAllFlying(uin);

    if (fly_list.length <= 0) {
      //flycraft not flying
      return new Promise((_, rej) => rej("飞机没有起飞"));
    }

    const fly_info = fly_list[0];

    if ((fly_info.timestamp as number) > new Date().getTime()) {
      return new Promise((_, rej) =>
        rej("数据库字段错误,timeout记录的时间大于本地时间")
      );
    }

    try {
      await RemoveFlycraftFlying(uin);
      for (const i of parameter) {
        if (i[1].type == game.type) {
          const add_score =
            ((new Date().getTime() - Number(fly_info.timestamp)) /
              1000 /
              60 /
              10) *
            i[1].score *
            0.01;
          try {
            await SettingsUserCon(
              uin,
              Number(user.score) + Math.floor(Number(add_score))
            );

            return new Promise((res) =>
              res({
                add_score: Math.floor(Number(add_score)),
                time: new Date().getTime() - Number(fly_info.timestamp),
              })
            );
          } catch (err) {
            return new Promise((_, rej) => rej(err));
          }
        }
      }
      throw "";
    } catch (err) {
      return new Promise((_, rej) => rej(err));
    }
  } catch (err) {
    return new Promise((_, rej) => rej(err));
  }
}

/**transmit buttle */
export async function transmit(
  uin: number,
  user?: User,
  game?: GameUser
): Promise<TransmitRes> {
  try {
    if (user == undefined) {
      user = await QueryUserData(uin);
    }

    if (game == undefined) {
      game = await QueryGameUserData(uin);
    }

    if (game.allow != 3) {
      return new Promise((_, rej) => rej("飞行员不能打飞机"));
    }

    const fly_list = await GetAllFlying();

    if (fly_list.length < 5) {
      return new Promise((_, rej) => rej("飞机数量过少"));
    }

    if (game.bulletN <= 0) {
      return new Promise((_, rej) => rej("炮弹不够"));
    }

    if (new Date().getTime() - Number(game.timeout) < config.timeout) {
      return new Promise((_, rej) => rej("频率过高"));
    }

    if (game.type == 0) {
      return new Promise((_, rej) => rej("用户没有大炮"));
    }
    const id = Math.floor(Math.random() * fly_list.length);
    const choose_fly = fly_list[id];

    const user_gan = await GetGanInfoByType(game.type);

    let choose_fly_info!: Aircraft;
    for (const a of parameter) {
      if (a[1].type == choose_fly.type) {
        choose_fly_info = a[1] as Aircraft;
      }
    }

    const damage: number =
      choose_fly_info.级别 == user_gan.级别
        ? user_gan.暴击攻击
        : user_gan.攻击系数;

    //扣除发射者的一个炮弹,并设置timeout
    await SettingsGameUserCon(
      uin,
      game.type,
      game.allow,
      Number(game.bulletN) - 1,
      new Date().getTime()
    );

    //计算击毁概率
    if (damage >= choose_fly_info.防御系数) {
      const destruction_probability = (damage - choose_fly_info.防御系数) * 100;
      if (Math.floor(Math.random() * 101) <= destruction_probability) {
        //击毁飞机
        await RemoveFlycraftFlying(choose_fly.QQid);

        //给攻击者加分
        await SettingsUserCon(uin, choose_fly_info.score * 0.6 + user.score);
        return new Promise((res) =>
          res({
            fly: false,
            gan: true,
            score: choose_fly_info.score * 0.6,
            fly_master_uin: choose_fly.QQid,
            fly_flying_time:
              new Date().getTime() - Number(choose_fly.timestamp),
          })
        );
      } else {
        //没有击毁飞机
        return new Promise((res) =>
          res({
            fly: true,
            gan: true,
            score: 0,
            fly_flying_time: 0,
            fly_master_uin: 0,
          })
        );
      }
    }

    //大炮炸膛的概率
    const blast_chamber = (choose_fly_info.防御系数 - damage) * 100;
    if (Math.floor(Math.random() * 101) <= blast_chamber) {
      //大炮炸膛
      await SettingsGameUserCon(uin, 0, game.allow, game.bulletN, game.timeout);

      return new Promise((res) =>
        res({
          fly: true,
          gan: false,
          score: 0,
          fly_master_uin: 0,
          fly_flying_time: 0,
        })
      );
    } else {
      //大炮没有炸膛
      return new Promise((res) =>
        res({
          fly: true,
          gan: true,
          score: 0,
          fly_flying_time: 0,
          fly_master_uin: 0,
        })
      );
    }
  } catch (err) {
    return new Promise((_, rej) => rej(err));
  }
}

export async function GetAllFlying(uin?: number): Promise<Flying[]> {
  return new Promise((res, rej) => {
    const sql = mysql.createPool(config.database);
    sql.query(
      {
        sql:
          uin == undefined
            ? `select * from game_a_sky`
            : `select * from game_a_sky where QQid='${uin}'`,
      },
      (err, data) => {
        sql.end();
        if (err && !Array.isArray(data)) {
          rej(err);
          return;
        }

        const ret: Flying[] = [];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const i of data as any[]) {
          if (
            i.QQid == undefined ||
            i.type == undefined ||
            i.timestamp == undefined
          ) {
            return;
          }
          ret.push({
            QQid: i.QQid,
            type: i.type,
            timestamp: i.timestamp,
          });
        }

        res(ret);
      }
    );
  });
}

export async function RemoveFlycraftFlying(uin: number): Promise<void> {
  try {
    const list = await GetAllFlying();
    for (const a of list) {
      if (a.QQid == uin) {
        return new Promise((res, rej) => {
          const sql = mysql.createPool(config.database);
          sql.query(
            {
              sql: `delete from game_a_sky where QQid='${uin}'`,
            },
            (err) => {
              if (err) {
                rej(err);
                return;
              }

              res();
            }
          );
        });
      }
    }
  } catch (err) {
    return new Promise((_, rej) => rej(err));
  }
}

export async function CreateFlyTakeoff(
  uin: number,
  type: number,
  timestamp: number
): Promise<void> {
  try {
    const list = await GetAllFlying(uin);
    if (list.length > 0) {
      return new Promise((_, rej) => rej("已经有飞机在飞行了"));
    }

    return new Promise((res, rej) => {
      const sql = mysql.createPool(config.database);
      sql.query(
        {
          sql: `insert into game_a_sky (QQid, type, timestamp) values ('${uin}', '${type}', '${timestamp}')`,
        },
        (err) => {
          sql.end();
          if (err) {
            rej(err);
            return;
          }

          res();
          return;
        }
      );
    });
  } catch (err) {
    return new Promise((_, rej) => rej(err));
  }
}

export async function GetGanInfoByType(type: number): Promise<Artillery> {
  for (const a of parameter) {
    if (a[1].type == type) {
      return new Promise((res) =>
        res({
          type: type as 201 | 202 | 203 | 204,
          score: a[1].score,
          攻击系数: a[1].攻击系数 as number,
          级别: a[1].级别,
          暴击攻击: a[1].暴击攻击 as number,
        })
      );
    }
  }
  return new Promise((_, rej) => rej());
}

interface Flying {
  QQid: number;
  type: number;
  timestamp: number;
}

interface TransmitRes {
  /**fly和gan为false时表示被摧毁 */
  fly: boolean;
  gan: boolean;
  score: number;
  fly_master_uin: number;
  fly_flying_time: number;
}
