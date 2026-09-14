import { registerEnv } from "@sorokchat-messenger/config";
import { TokenSchema } from "../schemas/index.js";

export function getTokensEnv(data: unknown) {
  return registerEnv("tokens", TokenSchema, data);
}
