import "dotenv/config";
import { getBasicEnv, getGrpcEnv } from "@sorokchat-messenger/config";
import { getDatabaseEnv } from "./database.env.js";

export const loadEnv = [
  getBasicEnv(process.env),
  getGrpcEnv(process.env),
  getDatabaseEnv(process.env),
];
