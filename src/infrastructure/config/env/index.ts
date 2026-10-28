import "dotenv/config";
import { getBasicEnv, getGrpcEnv } from "@sorokchat-messenger/config";
import { getTokensEnv } from "./tokens.env.js";
import { getUsersEnv } from "./users.env.js";

export function loadEnv() {
  return [
    getBasicEnv(process.env),
    getGrpcEnv(process.env),
    getTokensEnv(process.env),
    getUsersEnv(process.env)
  ];
}
