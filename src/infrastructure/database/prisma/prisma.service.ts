import { Injectable, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "../../../generated/prisma/client.js";
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from "@nestjs/config";
import { AllConfigs } from "../../config/index.js";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    public constructor(configService: ConfigService<AllConfigs>) {
        super({ adapter: new PrismaPg({ connectionString: configService.getOrThrow('database.url', { infer: true }) }) })
    }

    public async onModuleInit() {
        await this.$connect();
    }

    public async onModuleDestroy() {
        await this.$disconnect();
    }

}