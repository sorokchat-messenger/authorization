import { Global, Module } from "@nestjs/common";
import { SIGNING_PROVIDER } from "./signing.provider.js";
import { PASSWORD_SECRET_PROVIDER } from "./password-secret.provider.js";

@Global()
@Module({
  providers: [SIGNING_PROVIDER, PASSWORD_SECRET_PROVIDER],
  exports: [SIGNING_PROVIDER, PASSWORD_SECRET_PROVIDER],
})
export class CryptographyModule {}
