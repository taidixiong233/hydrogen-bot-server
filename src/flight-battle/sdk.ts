export interface TokenDATA {
  ip: string | string[];
  useruuid: string;
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

export interface Flying {
  QQid: number;
  type: number;
  timestamp: number;
}

export interface TransmitRes {
  /**fly和gan为false时表示被摧毁 */
  fly: boolean;
  gan: boolean;
  score: number;
  fly_master_uin: number;
  fly_flying_time: number;
}

export enum things {
  "纸飞机" = 101,
  "木飞机",
  "铁皮飞机",
  "钢化飞机",
  "窜天猴发射器" = 201,
  "对天导弹发射器",
  "多角度发射器",
  "高精度发射器",
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
