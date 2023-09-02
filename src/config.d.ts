declare const config: {
  port: number;
  database: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };
  secret: string;
  user: Map<string, UserKey>;
  timeout: number;
  version: string;
};
export interface UserKey {
  ascii: string;
  hex: string;
  base32: string;
  otpauth_url: string;
  ip: string | string[];
}
export default config;
