import "dotenv/config";
import { getBasicEnv, getGrpcEnv } from "@sorokchat-messenger/config";

export const loadEnv = [getBasicEnv(process.env), getGrpcEnv(process.env)];
