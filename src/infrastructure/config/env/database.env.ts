import { registerEnv } from "@sorokchat-messenger/config";
import { DatabaseSchema } from "../schemas/index.js";

export function getDatabaseEnv(data: unknown) {
  return registerEnv("database", DatabaseSchema, data);
}
