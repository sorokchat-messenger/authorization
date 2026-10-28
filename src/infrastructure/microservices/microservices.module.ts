import { DynamicModule, Module, Type } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClientModule, USERS_CLIENT } from '@sorokchat-messenger/microservices';
import { type AllConfigs } from "../config/index.js";

const ClientModule = createClientModule([{
    ...USERS_CLIENT,
    inject: [ConfigService],
    urlFactory(config: ConfigService<AllConfigs>) {
        const host = config.getOrThrow('users.host', { infer: true });
        const port = config.getOrThrow('users.port', { infer: true });
        return `${host}:${port}`;
    }
}]) as DynamicModule;

@Module({
    imports: [ClientModule]
})
export class MicroservicesModule { }