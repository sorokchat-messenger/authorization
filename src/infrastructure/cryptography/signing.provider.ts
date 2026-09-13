import { type Provider } from "@nestjs/common";
import { type ISigning } from "@sorokchat-messenger/cryptography-abstractions";
import { HmacSigning } from "@sorokchat-messenger/cryptography-node";

export const SIGNING_TOKEN: string = "SIGNING";

export const SIGNING_PROVIDER: Provider<ISigning> = {
  provide: SIGNING_TOKEN,
  useClass: HmacSigning,
};
