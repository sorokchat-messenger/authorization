import { Inject, Injectable, Logger } from "@nestjs/common";
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
  USERS_SERVICE_NAME,
  type UsersServiceClient,
  type GetUserResponse
} from "@sorokchat-messenger/microservices";
import { AuthorizationCodes, UserCodes } from "@sorokchat-messenger/contracts";
import {
  type TokensConfig,
} from "../../infrastructure/index.js";
import { TokensService } from "../tokens/tokens.service.js";
import { TOKENS_OPTIONS_TOKEN } from "../tokens/tokens.options.provider.js";
import { TokenModel } from "../tokens/token.model.js";
import { createError } from "../../utils/index.js";
import { lastValueFrom } from "rxjs";
import { RpcException } from "@nestjs/microservices";

@Injectable()
export class AuthorizationService {
  private readonly logger = new Logger(AuthorizationService.name);

  public constructor(
    @Inject(USERS_SERVICE_NAME) private readonly usersService: UsersServiceClient,
    @Inject(TOKENS_OPTIONS_TOKEN) private readonly tokensOptions: TokensConfig,
    private readonly tokensService: TokensService,
  ) { }

  public async register(payload: RegisterRequest): Promise<RegisterResponse> {
    const { user } = await lastValueFrom(this.usersService.create(payload));
    if (user === undefined) throw new RpcException({
      message: UserCodes.EXISTS,
      code: GrpcStatus.ALREADY_EXISTS
    });
    return await this.authorize(user);
  }

  public async login(payload: LoginRequest): Promise<LoginResponse> {
    const { user } = await lastValueFrom(this.usersService.checkCredentials(payload));
    if (!user)
      throw createError(
        GrpcStatus.INVALID_ARGUMENT,
        AuthorizationCodes.BAD_CREDENTIALS,
      );
    return await this.authorize(user);
  }

  public async refreshTokens({
    refreshToken,
  }: RefreshTokensRequest): Promise<RefreshTokensResponse> {
    const token = TokenModel.parse(
      refreshToken,
      this.tokensOptions.refresh.secret,
    );
    const user = await lastValueFrom(this.usersService.getById({ id: token.subject }));
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
    this.logger.debug(`Access token: "${accessToken}"`);
    try {
      const token = TokenModel.parse(
        accessToken,
        this.tokensOptions.access.secret,
      );
      this.logger.debug(`Parsed token: ${JSON.stringify(token)}`);
      const user = await lastValueFrom(this.usersService.getById({ id: token.subject }));
      if (!user) {
        this.logger.debug(`User by login "${token.subject}" not found`);
        throw createError(
          GrpcStatus.UNAUTHENTICATED,
          AuthorizationCodes.UNAUTHORIZED,
        );
      }
      const result = {
        id: user.id,
        login: user.login,
        displayName: user.displayName,
        role: user.role as Role,
      };
      this.logger.debug(`USER: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error(`Unknown error: `, error);
      throw error;
    }
  }

  private async authorize(
    user: GetUserResponse,
  ): Promise<RegisterResponse | LoginResponse | RefreshTokensResponse> {
    return await this.tokensService.generateTokens(user);
  }
}
