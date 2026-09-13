import "dotenv/config";
import { getBasicEnv, getGrpcEnv } from "@sorokchat-messenger/config";
import { getDatabaseEnv } from "./database.env.js";
import { getCryptographyEnv } from "./cryptography.env.js";

export function loadEnv() {
  return [
    getBasicEnv(process.env),
    getGrpcEnv(process.env),
    getDatabaseEnv(process.env),
    getCryptographyEnv(process.env),
  ];
}
