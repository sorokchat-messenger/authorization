import { Inject, Injectable } from "@nestjs/common";
import { TOKENS_OPTIONS_TOKEN } from "./tokens.options.provider.js";
import { type TokensConfig } from "../../infrastructure/index.js";
import { UserModel } from "../users/user.model.js";
import { TokenModel } from "./token.model.js";
import type {
  LoginResponse,
  RefreshTokensResponse,
  RegisterResponse,
} from "@sorokchat-messenger/microservices";

@Injectable()
export class TokensService {
  public constructor(
    @Inject(TOKENS_OPTIONS_TOKEN) private readonly tokensOptions: TokensConfig,
  ) {}

  public async generateTokens(
    user: UserModel,
  ): Promise<RegisterResponse | LoginResponse | RefreshTokensResponse> {
    const refreshToken = this.generateRefreshToken(user);
    const acccessToken = this.generateAccessToken(user);
    return {
      accessToken: await this.serializeToken(
        acccessToken,
        this.tokensOptions.access.secret,
      ),
      refreshToken: await this.serializeToken(
        refreshToken,
        this.tokensOptions.refresh.secret,
      ),
    };
  }

  private generateRefreshToken(user: UserModel): TokenModel {
    return this.generateToken(user, this.tokensOptions.refresh.duration);
  }

  private generateAccessToken(user: UserModel): TokenModel {
    return this.generateToken(user, this.tokensOptions.access.duration);
  }

  private generateToken(user: UserModel, duration: number): TokenModel {
    const now = new Date();
    return TokenModel.of(user.login, now, new Date(now.getTime() + duration));
  }

  private async serializeToken(
    token: TokenModel,
    secret: string,
  ): Promise<string> {
    return `${token.subject}:${secret}`;
  }
}
