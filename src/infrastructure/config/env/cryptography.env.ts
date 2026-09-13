import { registerEnv } from "@sorokchat-messenger/config";
import { CryptographySchema } from "../schemas/index.js";

export function getCryptographyEnv(data: unknown) {
  return registerEnv("cryptography", CryptographySchema, data);
}
