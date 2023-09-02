import jwt from "jsonwebtoken";
import config from "../config";
import speakeasy from "speakeasy";

/**检测请求的token */
export async function check_token(token: string): Promise<TokenDATA> {
  return new Promise((res, rej) => {
    jwt.verify(token, config.secret, (err, data) => {
      if (err) rej(err);
      else res(data as TokenDATA);
    });
  });
}

/**生成token */
export function get_token(ip: string | string[], useruuid: string): string {
  return jwt.sign({ ip: ip, useruuid: useruuid }, config.secret);
}

/**authorization token check by request of http post */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function authorization_token(res: any): Promise<void> {
  try {
    if (String(res.headers.authorization?.split(" ")[1]) == "") {
      return new Promise<void>((_, rej) => rej());
    }

    const token = String(res.headers.authorization?.split(" ")[1]);
    const JWTdata: TokenDATA = await check_token(token);

    if (Array.isArray(JWTdata.ip)) {
      if (JWTdata.ip.includes(res.ip)) {
        return new Promise<void>((res) => res());
      }

      return new Promise<void>((_, rej) => rej());
    }

    if (res.ip != JWTdata.ip) {
      return new Promise<void>((_, rej) => rej());
    }

    return new Promise<void>((res) => res());
  } catch (err) {
    return new Promise<void>((_, rej) => rej(err));
  }
}

interface TokenDATA {
  ip: string | string[];
  useruuid: string;
}

/**登录时使用动态密码 */

// const key = speakeasy.generateSecret();
// console.log(key)
// console.log(`otpauth://totp/useruuid?secret=${key.base32}&issuer=飞行员大作战api双重验证`);

/**目前版本没有单独设置密码，这个2fa是不科学的，但是动态密码使用了相应功能，就先这么说吧 */
export function check_2fa(code: string, useruuid: string) {
  if (config.user.has(useruuid)) {
    if (
      code ==
      speakeasy.totp({
        secret: (
          config.user.get(useruuid) as {
            ascii: string;
            hex: string;
            base32: string;
            otpauth_url: string;
          }
        ).ascii,
      })
    ) {
      return true;
    }
  }

  return false;
}

export enum errorcode {
  success = 200,
  data_error,
  things_career_error,
  not_found_things,
  score_less,
  career_mismatch,
  flycraft_flying,
  user_not_have_flycraft,
  revocation_flight_permit,
  user_isnot_flight_permit,
  flycraft_isnot_flying,
  flying_less,
  buttle_less,
  transmit_speed_more_timeout,
  authorization_error = 403,
  notfound,
  unknown_error,
  database_error,
  database_error_parameter_error = 40601,
}
