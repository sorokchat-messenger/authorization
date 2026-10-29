import { DynamicModule, Global, Module } from "@nestjs/common";
import { createClientModule } from '@sorokchat-messenger/microservices';
import { getUsersOptions } from "../options/index.js";
import { USERS_SERVICE_PROVIDER } from "./providers/index.js";

const ClientModule = createClientModule([
    getUsersOptions()
]) as DynamicModule;

@Global()
@Module({
    imports: [ClientModule],
    providers: [USERS_SERVICE_PROVIDER],
    exports: [USERS_SERVICE_PROVIDER]
})
export class MicroservicesModule { }