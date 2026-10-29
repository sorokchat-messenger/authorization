import { type Provider } from "@nestjs/common";
import {
    USERS_SERVICE,
    UsersServiceClient,
} from "@sorokchat-messenger/microservices";
import { ClientGrpc } from "@nestjs/microservices";

export const USERS_SERVICE_TOKEN: string = "USERS_SERVICE";
export const USERS_SERVICE_PROVIDER: Provider<UsersServiceClient> =
{
    provide: USERS_SERVICE_TOKEN,
    inject: [USERS_SERVICE.NAME],
    useFactory(client: ClientGrpc): UsersServiceClient {
        return client.getService<UsersServiceClient>(
            USERS_SERVICE.NAME,
        );
    },
};
