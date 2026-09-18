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
import { GrpcStatus } from "@sorokchat-messenger/microservices";
import { createError } from "../../utils/index.js";

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
      throw createError(GrpcStatus.ALREADY_EXISTS, UserCodes.EXISTS);
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

  public async getById(id: number): Promise<UserModel> {
    const user = await this.repository.getById(id);
    if (user === null) {
      throw createError(GrpcStatus.NOT_FOUND, UserCodes.NOT_FOUND);
    } else {
      return user;
    }
  }

  public async getByLogin(login: string): Promise<UserModel> {
    const user = await this.repository.getByLogin(login);
    if (user === null) {
      throw createError(GrpcStatus.NOT_FOUND, UserCodes.NOT_FOUND);
    } else {
      return user;
    }
  }

  public async update(user: UserModel): Promise<UserModel> {
    const candidate = await this.getByLogin(user.login);
    if (candidate !== null && user.id !== candidate.id) {
      throw createError(GrpcStatus.ALREADY_EXISTS, UserCodes.EXISTS);
    } else {
      return await this.repository.save(user);
    }
  }

  public async delete(id: number): Promise<void> {
    const user = await this.getById(id);
    return await this.repository.delete(user.id);
  }
}
