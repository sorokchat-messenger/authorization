import { Inject, Injectable } from "@nestjs/common";
import {
  GrpcStatus,
  type ProfileRequest,
  type ProfileResponse,
  type RefreshTokensRequest,
  type RefreshTokensResponse,
  Role,
  type LoginRequest,
  type LoginResponse,
  type RegisterRequest,
  type RegisterResponse,
} from "@sorokchat-messenger/microservices";
import { UsersService } from "../users/users.service.js";
import { UserModel } from "../users/user.model.js";
import { GrpcException } from "@nestjs/microservices";
import { AuthorizationCodes, UserCodes } from "@sorokchat-messenger/contracts";
import {
  PASSWORD_SECRET_TOKEN,
  SIGNING_TOKEN,
} from "../../infrastructure/index.js";
import { type ISigning } from "@sorokchat-messenger/cryptography-abstractions";

@Injectable()
export class AuthorizationService {
  private static readonly EXCEPTION = new GrpcException(
    AuthorizationCodes.BAD_CREDENTIALS,
    GrpcStatus.INVALID_ARGUMENT,
  );

  public constructor(
    private readonly usersService: UsersService,
    @Inject(SIGNING_TOKEN) private readonly signingService: ISigning,
    @Inject(PASSWORD_SECRET_TOKEN) private readonly secret: string,
  ) {}

  public async register(payload: RegisterRequest): Promise<RegisterResponse> {
    const user = await this.usersService.create(payload);
    return await this.authorize(user);
  }

  public async login(payload: LoginRequest): Promise<LoginResponse> {
    try {
      const candidate = await this.usersService.getByLogin(payload.login);
      const isPasswordValid = await candidate.verifyPassword(
        this.signingService,
        this.secret,
        payload.password,
      );
      if (!isPasswordValid) throw AuthorizationService.EXCEPTION;
      return await this.authorize(candidate);
    } catch (error) {
      throw this.validateError(error);
    }
  }

  public async refreshTokens({
    refreshToken,
  }: RefreshTokensRequest): Promise<RefreshTokensResponse> {
    try {
      const user = await this.usersService.getByLogin(refreshToken);
      return await this.authorize(user);
    } catch (error) {
      throw this.validateError(error);
    }
  }

  public async profile({
    accessToken,
  }: ProfileRequest): Promise<ProfileResponse> {
    const user = await this.usersService.getByLogin(accessToken);
    return {
      login: user.login,
      password: user.hashedPassword,
      role: user.role as Role,
      displayName: user.displayName,
    };
  }

  private async authorize(
    user: UserModel,
  ): Promise<RegisterResponse | LoginResponse | RefreshTokensResponse> {
    return {
      accessToken: user.login,
      refreshToken: user.login,
    };
  }

  private validateError(error: unknown): GrpcException | unknown {
    if (
      error instanceof GrpcException &&
      error.getCode() === GrpcStatus.NOT_FOUND &&
      error.message === UserCodes.NOT_FOUND
    ) {
      return AuthorizationService.EXCEPTION;
    }
    return error;
  }
}
