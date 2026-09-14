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
import { sign } from "jsonwebtoken";

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
      accessToken: this.serialize(
        acccessToken,
        this.tokensOptions.access.secret,
      ),
      refreshToken: this.serialize(
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

  private serialize(token: TokenModel, secret: string): string {
    return sign(
      {
        sub: token.subject,
        iat: Math.floor(token.issuedAt.getTime() / 1000),
        exp: Math.floor(token.expiredAt.getTime() / 1000),
      },
      secret,
      { noTimestamp: true },
    );
  }
}
