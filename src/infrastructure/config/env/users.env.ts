import { registerEnv } from "@sorokchat-messenger/config";
import { UsersSchema } from "../schemas/index.js";

export function getUsersEnv(data: unknown) {
    return registerEnv("users", UsersSchema, data);
}