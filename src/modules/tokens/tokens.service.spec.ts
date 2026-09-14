import { Test, TestingModule } from "@nestjs/testing";
import { TokensService } from "./tokens.service.js";
import { MOCK_TOKENS_OPTIONS_PROVIDER } from "../../../test/index.js";
import { UserModel } from "../users/user.model.js";
import { Role } from "@sorokchat-messenger/contracts";

function checkJwt(token: string): void {
  const parts: string[] = token.split(".");
  expect(parts.length).toBe(3);
  for (const part of parts) {
    expect(part.length).toBeGreaterThan(0);
  }
}

describe("TokensService", () => {
  let service: TokensService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TokensService, MOCK_TOKENS_OPTIONS_PROVIDER],
    }).compile();

    service = module.get<TokensService>(TokensService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should success generateTokens", async () => {
    const user = UserModel.fromStorage(
      1,
      "login",
      "password",
      "login",
      Role.USER,
    );
    const tokens = await service.generateTokens(user);
    checkJwt(tokens.accessToken);
    checkJwt(tokens.refreshToken);
  });
});
