import Error from "tderrors";
import { Express } from "express";
import { authorization_token } from "../common/authorization";
import { errorcode } from "../common/authorization";
import ErrorChild from "../error";
import { AddUserData, QueryUserData } from "../common/user";

export default async function Init_User(
  app: Express,
  error: ErrorChild | Error
) {
  /**create new user in a datatable named user */
  app.post(`/create_user`, async (req, res) => {
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
  app.post(`/query_user`, async (req, res) => {
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
  error.postLog("模块加载成功");
}
