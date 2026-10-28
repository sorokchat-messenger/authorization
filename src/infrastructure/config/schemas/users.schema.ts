import { HostSchema, PortSchema } from "@sorokchat-messenger/config";
import z from "zod";

export const UsersSchema = z.object({
    USERS_HOST: HostSchema,
    USERS_PORT: PortSchema
}).transform(({ USERS_HOST, USERS_PORT }) => ({ host: USERS_HOST, port: USERS_PORT }));

export type UsersConfig = z.infer<typeof UsersSchema>;