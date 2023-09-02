import { artillery, flycraft } from "..";
import Error from "tderrors";
import { Express } from "express";
import { errorcode, authorization_token } from "./common";
import {
  GameUser,
  QueryGameUserData,
  QueryUserData,
  SettingsGameUserCon,
  SettingsUserCon,
  User,
} from "./user";
import parameter from "../gameconfig";
import * as mysql from "mysql";
import config from "../config";

export async function Init_store(app: Express, error: Error) {
  /**this store YAYAYA */
  app.post("/store_buy", async (req, res) => {
    try {
      await authorization_token(req);
      //begin query
      const { uin, things } = req.body as { uin: number; things: string };
      try {
        if (!uin || Number.isNaN(Number(uin)) || !things) {
          res.json({
            message: "参数错误",
            status: "error",
          });
          return;
        }
        const userdata = await QueryUserData(uin);
        const gamedata = await QueryGameUserData(uin);

        //if user has things
        if (gamedata.type != 0) {
          res.json({
            code: errorcode.data_error,
            status: "error",
            message: "用户已经有了物品",
            data: gamedata,
          });
          return;
        }

        try {
          //check career again
          if (gamedata.allow == 3) {
            if (flycraft.includes(things)) {
              res.json({
                code: errorcode.things_career_error,
                message: "炮兵不能购买飞机",
              });
              return;
            } else {
              const ret = await buy_thing(uin, things, userdata, gamedata);

              //buy successed
              res.json({
                code: errorcode.success,
                status: "ok",
                data: ret.gameuser.type,
              });
              return;
            }
          } else if (artillery.includes(things)) {
            res.json({
              code: errorcode.things_career_error,
              message: "飞行员不能购买大炮",
            });
            return;
          } else {
            const ret = await buy_thing(uin, things, userdata, gamedata);

            //buy successed
            res.json({
              code: errorcode.success,
              status: "ok",
              data: ret.gameuser.type,
            });
            return;
          }
        } catch (err) {
          if (err && typeof err == "string") {
            switch (err) {
              case "没有找到商品":
                res.json({
                  code: errorcode.not_found_things,
                  status: "error",
                  message: "没有找到商品",
                });
                return;
              case "积分不足":
                res.json({
                  code: errorcode.score_less,
                  status: "error",
                  message: "积分不足",
                });
                return;
            }
            //unknown error
            res.json({
              code: errorcode.unknown_error,
              status: "error",
              message: "未知错误",
            });
            return;
          }
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

  /**sale things */
  app.post("/store_sale", async (req, res) => {
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
        const gamedata = await QueryGameUserData(uin);

        try {
          await store_sale(uin, userdata, gamedata);
          //success
          res.json({
            code: errorcode.success,
            status: "ok",
          });
          return;
        } catch (err) {
          if (err && typeof err == "string") {
            switch (err) {
              case "用户没有物品":
                res.json({
                  code: errorcode.not_found_things,
                  status: "error",
                  message: "用户没有物品",
                });
                return;
              case "type参数错误":
                res.json({
                  code: errorcode.database_error_parameter_error,
                  status: "error",
                  message: "type参数错误",
                });
                return;
            }
            //unknown error
            res.json({
              code: errorcode.unknown_error,
              status: "error",
              message: "未知错误",
            });
            return;
          }
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

  /**sale buttle */
  app.post("/store_buy_buttle", async (req, res) => {
    try {
      await authorization_token(req);
      //begin query
      const { uin, number } = req.body as { uin: number; number: number };
      try {
        if (
          !uin ||
          Number.isNaN(Number(uin)) ||
          !number ||
          Number.isNaN(Number(number))
        ) {
          res.json({
            message: "参数错误",
            status: "error",
          });
          return;
        }
        const userdata = await QueryUserData(uin);
        const gamedata = await QueryGameUserData(uin);

        try {
          const new_ButtleN = await buy_buttle(uin, number, userdata, gamedata);
          res.json({
            code: errorcode.success,
            status: "ok",
            data: new_ButtleN,
            message: "data段是新的炮弹数",
          });
          return;
        } catch (err) {
          if (typeof err == "string") {
            switch (err) {
              case "用户是飞行员":
                res.json({
                  code: errorcode.things_career_error,
                  status: "error",
                  message: err,
                });
                return;
              case "积分不够":
                res.json({
                  code: errorcode.score_less,
                  status: "error",
                  message: "积分不够",
                });
                return;
            }
          }
          //unknown error
          res.json({
            code: errorcode.unknown_error,
            status: "error",
            message: "未知错误",
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

  /**apply flight permit */
  app.post("/store_buy_flight_permit", async (req, res) => {
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
        const gamedata = await QueryGameUserData(uin);

        try {
          await apply_FP(uin, userdata, gamedata);
          res.json({
            code: errorcode.success,
            status: "ok",
          });
          return;
        } catch (err) {
          if (typeof err == "string") {
            switch (err) {
              case "用户是炮兵":
                res.json({
                  code: errorcode.things_career_error,
                  status: "error",
                  message: err,
                });
                return;
              case "积分不够":
                res.json({
                  code: errorcode.score_less,
                  status: "error",
                  message: "积分不够",
                });
                return;
              case "已经办理了飞行许可":
                res.json({
                  code: errorcode.data_error,
                  status: "error",
                  message: "已经办理了飞行许可",
                });
                return;
            }
          }
          //unknown error
          res.json({
            code: errorcode.unknown_error,
            status: "error",
            message: "未知错误",
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

  error.postLog("store模块加载完毕");
}

/**bug thing */
async function buy_thing(
  uin: number,
  things: string,
  user?: User,
  game?: GameUser
): Promise<{ user: User; gameuser: GameUser }> {
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

  return new Promise((res, rej) => {
    const thingstype = (function () {
      try {
        return parameter.get(String(getFlycraft(things)))?.type as number;
      } catch {
        try {
          return parameter.get(String(getArtillery(things)))?.type as number;
        } catch {
          rej("没有找到商品");
        }
      }
    })();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const score: number = (function (rej: (reason?: any) => void): number {
      for (const i of parameter) {
        if (thingstype == i[1].type) {
          return i[1].score;
        }
      }
      rej("没有找到商品");
      return 0;
    })(rej);

    //查询用户积分是否充足
    if ((user as User).score < score) {
      rej("积分不足");
      return;
    }

    //进行扣除积分
    const sql = mysql.createPool(config.database);
    sql.query(
      {
        sql: `update user set score='${
          (user as User).score - score
        }' where QQid='${uin}'`,
      },
      (err) => {
        if (err) {
          sql.end();
          rej(err);
        } else {
          //扣费成功，现在开始发放物品
          sql.query(
            {
              sql: `update game_user_a set type='${thingstype}' where QQid='${uin}'`,
            },
            (err) => {
              sql.end();
              if (err) {
                rej(err);
              } else {
                res({
                  user: {
                    ...(user as Omit<User, "score">),
                    score: (user as User).score - score,
                  },
                  gameuser: {
                    ...(game as Omit<GameUser, "type">),
                    type: thingstype as number,
                  },
                });
              }
            }
          );
        }
      }
    );
  });
}

/**buy buttle
 * @returns 用户现有的炮弹数
 */
async function buy_buttle(
  uin: number,
  number: number,
  user?: User,
  game?: GameUser
): Promise<number> {
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

  if (game.allow != 3) {
    return new Promise((_, rej) => rej("用户是飞行员"));
  }

  if (user.score < 50 * number) {
    return new Promise((_, rej) => rej("积分不够"));
  }

  try {
    await SettingsUserCon(uin, Number(user.score) - 50 * number);
    await SettingsGameUserCon(
      uin,
      game.type,
      game.allow,
      Number((game as { bulletN: number }).bulletN) + Number(number)
    );

    return new Promise((res) =>
      res(Number((game as { bulletN: number }).bulletN) + Number(number))
    );
  } catch (err) {
    return new Promise((_, rej) => rej(err));
  }
}

/**sale things */
async function store_sale(
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

  return new Promise<void>((res, rej) => {
    if (game?.type == 0) {
      //don't have things
      rej("用户没有物品");
      return;
    }

    const sql = mysql.createPool(config.database);
    sql.query(
      {
        sql: `update game_user_a set type='0' where QQid='${uin}'`,
      },
      async (err) => {
        sql.end();
        if (err) {
          rej(err);
          return;
        }

        for (const i of parameter) {
          if (i[1].type == game?.type) {
            const new_score = Number(user?.score) + Number(i[1].score) * 0.6;
            try {
              await SettingsUserCon(uin, new_score);

              //successed
              res();
              return;
            } catch (err) {
              rej(err);
              return;
            }
          }
        }

        rej("type参数错误");
        return;
      }
    );
  });
}

/**apply flight permit */
async function apply_FP(uin: number, user?: User, game?: GameUser) {
  try {
    if (user == undefined) {
      user = await QueryUserData(uin);
    }

    if (game == undefined) {
      game = await QueryGameUserData(uin);
    }

    if (game.allow == 3) {
      return new Promise((_, rej) => rej("用户是炮兵"));
    }

    if (game.allow == 0) {
      return new Promise((_, rej) => rej("已经办理了飞行许可"));
    }

    if (user.score < 100) {
      return new Promise((_, rej) => rej("积分不足"));
    }

    await SettingsUserCon(uin, Number(user.score) - 100);
    await SettingsGameUserCon(uin, game.type, 0, game.bulletN, game.timeout);

    return new Promise<void>((res) => res());
  } catch (err) {
    return new Promise((_, rej) => rej(err));
  }
}

/**解析飞机的名字 */
function getFlycraft(
  msg: string
): "纸飞机" | "木飞机" | "铁皮飞机" | "钢化飞机" {
  for (const i of flycraft) {
    if (RegExp(`/${i}/`).test(i))
      return i as "纸飞机" | "木飞机" | "铁皮飞机" | "钢化飞机";
  }

  const data = msg.replace(/购买飞机/g, "").trim();

  if (/木/g.test(data)) return "木飞机";
  if (/纸/g.test(data)) return "纸飞机";
  if (/铁/g.test(data)) return "铁皮飞机";
  if (/钢/g.test(data)) return "钢化飞机";

  throw "没有找到相应的飞机";
}

/**解析大炮的名字 */
function getArtillery(
  msg: string
): "窜天猴发射器" | "对天导弹发射器" | "多角度发射器" | "高精度发射器" {
  for (const i of artillery) {
    if (RegExp(`/${i}/`).test(i))
      return i as
        | "窜天猴发射器"
        | "对天导弹发射器"
        | "多角度发射器"
        | "高精度发射器";
  }

  const data = msg.replace(/购买大炮/g, "").trim();
  const ret = (
    msg: string,
    v: string[],
    sign: "窜天猴发射器" | "对天导弹发射器" | "多角度发射器" | "高精度发射器"
  ):
    | "窜天猴发射器"
    | "对天导弹发射器"
    | "多角度发射器"
    | "高精度发射器"
    | null => {
    for (const i of v) {
      if (RegExp(i).test(msg)) {
        return sign;
      }
    }

    return null;
  };

  return (
    ret(data, ["窜", "猴"], "窜天猴发射器") ??
    ret(data, ["对", "导", "弹"], "对天导弹发射器") ??
    ret(data, ["多", "角", "度"], "多角度发射器") ??
    ret(data, ["高", "精", "度"], "高精度发射器") ??
    (function (): "多角度发射器" {
      throw "没有找到相应的大炮";
    })()
  );
}
