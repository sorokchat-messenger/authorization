import { type Provider } from "@nestjs/common";
import { type PasswordEncoder, type ISigning } from "@sorokchat-messenger/cryptography-abstractions";
import { PASSWORD_SECRET_TOKEN } from "./password-secret.provider.js";
import { Argon2PasswordEncoder } from "@sorokchat-messenger/cryptography-node";
import { SIGNING_TOKEN } from "./signing.provider.js";

export const PASSWORD_ENCODING_TOKEN: string = "PASSWORD_SIGNING";
export const PASSWORD_ENCODING_PROVIDER: Provider<PasswordEncoder> = {
    provide: PASSWORD_ENCODING_TOKEN,
    inject: [PASSWORD_SECRET_TOKEN, SIGNING_TOKEN],
    useFactory(secret: string, signing: ISigning): PasswordEncoder {
        return new Argon2PasswordEncoder(secret, signing);
    }
};