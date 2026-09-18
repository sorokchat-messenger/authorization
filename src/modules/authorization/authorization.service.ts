import { Inject, Injectable } from "@nestjs/common";
import {
  GrpcStatus,
  type ProfileRequest,
  type ProfileResponse,
  type RefreshTokensRequest,
  type RefreshTokensResponse,
  type Role,
  type LoginRequest,
  type LoginResponse,
  type RegisterRequest,
  type RegisterResponse,
} from "@sorokchat-messenger/microservices";
import { UsersService } from "../users/users.service.js";
import { UserModel } from "../users/user.model.js";
import { AuthorizationCodes } from "@sorokchat-messenger/contracts";
import {
  PASSWORD_SECRET_TOKEN,
  SIGNING_TOKEN,
  type TokensConfig,
} from "../../infrastructure/index.js";
import { type ISigning } from "@sorokchat-messenger/cryptography-abstractions";
import { TokensService } from "../tokens/tokens.service.js";
import { TOKENS_OPTIONS_TOKEN } from "../tokens/tokens.options.provider.js";
import { TokenModel } from "../tokens/token.model.js";
import { createError } from "../../utils/index.js";

@Injectable()
export class AuthorizationService {
  public constructor(
    private readonly usersService: UsersService,
    @Inject(SIGNING_TOKEN) private readonly signingService: ISigning,
    @Inject(PASSWORD_SECRET_TOKEN) private readonly secret: string,
    @Inject(TOKENS_OPTIONS_TOKEN) private readonly tokensOptions: TokensConfig,
    private readonly tokensService: TokensService,
  ) {}

  public async register(payload: RegisterRequest): Promise<RegisterResponse> {
    const user = await this.usersService.create(payload);
    return await this.authorize(user);
  }

  public async login(payload: LoginRequest): Promise<LoginResponse> {
    const candidate = await this.usersService.getByLogin(payload.login);
    if (!candidate)
      throw createError(
        GrpcStatus.INVALID_ARGUMENT,
        AuthorizationCodes.BAD_CREDENTIALS,
      );
    const isPasswordValid = await candidate.verifyPassword(
      this.signingService,
      this.secret,
      payload.password,
    );
    if (!isPasswordValid)
      throw createError(
        GrpcStatus.INVALID_ARGUMENT,
        AuthorizationCodes.BAD_CREDENTIALS,
      );
    return await this.authorize(candidate);
  }

  public async refreshTokens({
    refreshToken,
  }: RefreshTokensRequest): Promise<RefreshTokensResponse> {
    const token = TokenModel.parse(
      refreshToken,
      this.tokensOptions.refresh.secret,
    );
    const user = await this.usersService.getByLogin(token.subject);
    if (!user)
      throw createError(
        GrpcStatus.UNAUTHENTICATED,
        AuthorizationCodes.UNAUTHORIZED,
      );
    return await this.authorize(user);
  }

  public async profile({
    accessToken,
  }: ProfileRequest): Promise<ProfileResponse> {
    const token = TokenModel.parse(
      accessToken,
      this.tokensOptions.access.secret,
    );
    const user = await this.usersService.getByLogin(token.subject);
    if (!user)
      throw createError(
        GrpcStatus.UNAUTHENTICATED,
        AuthorizationCodes.UNAUTHORIZED,
      );
    return {
      login: user.login,
      role: user.role as Role,
      displayName: user.displayName,
    };
  }

  private async authorize(
    user: UserModel,
  ): Promise<RegisterResponse | LoginResponse | RefreshTokensResponse> {
    return await this.tokensService.generateTokens(user);
  }
}
