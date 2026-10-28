import { Global, Module } from "@nestjs/common";
import { SIGNING_PROVIDER } from "./signing.provider.js";

@Global()
@Module({
  providers: [SIGNING_PROVIDER],
  exports: [SIGNING_PROVIDER],
})
export class CryptographyModule { }
