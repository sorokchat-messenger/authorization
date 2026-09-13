import { Inject, Injectable } from "@nestjs/common";
import {
  PASSWORD_SECRET_TOKEN,
  SIGNING_TOKEN,
} from "../../infrastructure/index.js";
import { UserCodes, type NewUserPayload } from "@sorokchat-messenger/contracts";
import { UserModel } from "./user.model.js";
import type { ISigning } from "@sorokchat-messenger/cryptography-abstractions";
import {
  USERS_REPOSITORY_TOKEN,
  type IUsersRepository,
} from "./users.repository.interface.js";
import { GrpcException } from "@nestjs/microservices";
import { GrpcStatus } from "@sorokchat-messenger/microservices";

@Injectable()
export class UsersService {
  public constructor(
    @Inject(USERS_REPOSITORY_TOKEN)
    private readonly repository: IUsersRepository,
    @Inject(SIGNING_TOKEN) private readonly signingService: ISigning,
    @Inject(PASSWORD_SECRET_TOKEN) private readonly secret: string,
  ) {}

  public async create(payload: NewUserPayload): Promise<UserModel> {
    const candidate = await this.repository.getByLogin(payload.login);
    if (candidate !== null) {
      throw new GrpcException(UserCodes.EXISTS, GrpcStatus.ALREADY_EXISTS);
    }
    const user = await UserModel.create(
      payload.login,
      payload.password,
      this.signingService,
      this.secret,
      payload.displayName,
    );
    return await this.repository.save(user);
  }
}
