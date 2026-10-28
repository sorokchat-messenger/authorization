import { registerEnv } from "@sorokchat-messenger/config";
import { UserSchema } from "@sorokchat-messenger/contracts";

export function getUsersEnv(data: unknown) {
    return registerEnv("users", UserSchema, data);
}