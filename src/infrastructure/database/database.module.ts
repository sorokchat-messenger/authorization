import { Global, Module } from "@nestjs/common";
import { REPOSITORIES } from "./repositories/index.js";
import { PrismaModule } from "./prisma/index.js";

@Global()
@Module({
  imports: [PrismaModule],
  providers: REPOSITORIES,
  exports: REPOSITORIES,
})
export class DatabaseModule { }
