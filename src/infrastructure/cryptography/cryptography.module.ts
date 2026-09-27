import { Global, Module } from "@nestjs/common";
import { SIGNING_PROVIDER } from "./signing.provider.js";
import { PASSWORD_SECRET_PROVIDER } from "./password-secret.provider.js";
import { PASSWORD_ENCODING_PROVIDER } from "./password-encoding.provider.js";

@Global()
@Module({
  providers: [SIGNING_PROVIDER, PASSWORD_SECRET_PROVIDER, PASSWORD_ENCODING_PROVIDER],
  exports: [SIGNING_PROVIDER, PASSWORD_SECRET_PROVIDER, PASSWORD_ENCODING_PROVIDER],
})
export class CryptographyModule { }
