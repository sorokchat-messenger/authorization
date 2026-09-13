import { Module } from "@nestjs/common";
import { SIGNING_PROVIDER } from "./signing.provider.js";
import { PASSWORD_SECRET_PROVIDER } from "./password-secret.provide.js";

@Module({
  providers: [SIGNING_PROVIDER, PASSWORD_SECRET_PROVIDER],
  exports: [SIGNING_PROVIDER, PASSWORD_SECRET_PROVIDER],
})
export class CryptographyModule {}
