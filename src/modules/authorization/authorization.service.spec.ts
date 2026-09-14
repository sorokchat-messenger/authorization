import { Test, TestingModule } from "@nestjs/testing";
import { AuthorizationService } from "./authorization.service.js";
import { UsersService } from "../users/users.service.js";
import {
  MOCK_PASSWORD_SECRET_PROVIDER,
  MOCK_SIGNING_PROVIDER,
  MOCK_TOKENS_OPTIONS_PROVIDER,
  MOCK_USERS_REPOSITORY_PROVIDER,
} from "../../../test/index.js";
import {
  GrpcStatus,
  Role,
  type RegisterResponse,
  type RegisterRequest,
  type LoginRequest,
  type RefreshTokensRequest,
  type RefreshTokensResponse,
  type ProfileRequest,
  type ProfileResponse,
} from "@sorokchat-messenger/microservices";
import { GrpcException } from "@nestjs/microservices";
import { AuthorizationCodes, UserCodes } from "@sorokchat-messenger/contracts";
import { TokensService } from "../tokens/tokens.service.js";
import { UserModel } from "../users/user.model.js";
import { TokenModel } from "../tokens/token.model.js";

describe("AuthorizationService", () => {
  let service: AuthorizationService;
  let usersService: UsersService;
  let tokensService: TokensService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorizationService,
        MOCK_PASSWORD_SECRET_PROVIDER,
        MOCK_SIGNING_PROVIDER,
        MOCK_USERS_REPOSITORY_PROVIDER,
        MOCK_TOKENS_OPTIONS_PROVIDER,
        TokensService,
        UsersService,
      ],
    }).compile();

    service = module.get<AuthorizationService>(AuthorizationService);
    usersService = module.get<UsersService>(UsersService);
    tokensService = module.get<TokensService>(TokensService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should throw exception on register if user exists", async () => {
    const newUser: RegisterRequest = {
      login: "andrey",
      password: "password",
    };
    const expected = new GrpcException(
      UserCodes.EXISTS,
      GrpcStatus.ALREADY_EXISTS,
    );
    await usersService.create(newUser);
    expect(service.register(newUser)).rejects.toStrictEqual(expected);
  });

  it("should success register if user not exists", async () => {
    const newUser: RegisterRequest = {
      login: "andrey",
      password: "password",
    };
    const user = UserModel.fromStorage(
      1,
      newUser.login,
      newUser.password,
      newUser.login,
      Role.USER,
    );
    const expected: RegisterResponse = await tokensService.generateTokens(user);
    expect(service.register(newUser)).resolves.toStrictEqual(expected);
  });

  it("should success login if login and password correct", async () => {
    const newUser: RegisterRequest = {
      login: "andrey",
      password: "password",
    };
    await usersService.create(newUser);
    const user = UserModel.fromStorage(
      1,
      newUser.login,
      newUser.password,
      newUser.login,
      Role.USER,
    );
    const expected: RegisterResponse = await tokensService.generateTokens(user);
    expect(service.login(newUser)).resolves.toStrictEqual(expected);
  });

  it("should throw exception on login if not found", async () => {
    const loginRequest: LoginRequest = {
      login: "andrey",
      password: "password",
    };
    const expected = new GrpcException(
      AuthorizationCodes.BAD_CREDENTIALS,
      GrpcStatus.INVALID_ARGUMENT,
    );
    expect(service.login(loginRequest)).rejects.toStrictEqual(expected);
  });

  it("should throw exception on login if password invalid", async () => {
    const loginRequest: LoginRequest = {
      login: "andrey",
      password: "password",
    };
    await usersService.create({ login: loginRequest.login, password: "test" });
    const expected = new GrpcException(
      AuthorizationCodes.BAD_CREDENTIALS,
      GrpcStatus.INVALID_ARGUMENT,
    );
    expect(service.login(loginRequest)).rejects.toStrictEqual(expected);
  });

  it("should throw exception on refreshToken if user not found", async () => {
    const newUser: RegisterRequest = {
      login: "andrey",
      password: "password",
    };
    await usersService.create(newUser);
    const user = UserModel.fromStorage(
      1,
      newUser.login,
      newUser.password,
      newUser.login,
      Role.USER,
    );
    user.login = newUser.login + "a";
    const refreshTokenRequest: RefreshTokensRequest =
      await tokensService.generateTokens(user);
    const expected = new GrpcException(
      AuthorizationCodes.BAD_CREDENTIALS,
      GrpcStatus.INVALID_ARGUMENT,
    );
    expect(service.refreshTokens(refreshTokenRequest)).rejects.toStrictEqual(
      expected,
    );
  });

  it("should success refresh tokens", async () => {
    const newUser: RegisterRequest = {
      login: "andrey",
      password: "password",
    };
    const user = await usersService.create(newUser);
    const refreshTokenRequest: RefreshTokensRequest = {
      refreshToken: (await tokensService.generateTokens(user)).refreshToken,
    };
    const expected: RegisterResponse = await tokensService.generateTokens(user);
    expect(service.refreshTokens(refreshTokenRequest)).resolves.toStrictEqual(
      expected,
    );
  });

  it("should throw exception on profile if user not found", async () => {
    const user = UserModel.fromStorage(
      1,
      "andrey",
      "password",
      "andrey",
      Role.USER,
    );
    const profileRequest: ProfileRequest = {
      accessToken: (await tokensService.generateTokens(user)).accessToken,
    };
    const expected = new GrpcException(
      AuthorizationCodes.BAD_CREDENTIALS,
      GrpcStatus.INVALID_ARGUMENT,
    );
    expect(service.profile(profileRequest)).rejects.toStrictEqual(expected);
  });

  it("should success return user on profile if user found", async () => {
    const newUser: RegisterRequest = {
      login: "andrey",
      password: "password",
    };
    const user = await usersService.create(newUser);
    const profileRequest: ProfileRequest =
      await tokensService.generateTokens(user);
    const expected: ProfileResponse = {
      login: user.login,
      password: user.hashedPassword,
      role: user.role as Role,
      displayName: user.displayName,
    };
    expect(service.profile(profileRequest)).resolves.toStrictEqual(expected);
  });
});
