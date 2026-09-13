import { Test, TestingModule } from "@nestjs/testing";
import { AuthorizationService } from "./authorization.service.js";
import { UsersService } from "../users/users.service.js";
import {
  MOCK_PASSWORD_SECRET_PROVIDER,
  MOCK_SIGNING_PROVIDER,
  MOCK_USERS_REPOSITORY_PROVIDER,
} from "../../../test/index.js";
import {
  GrpcStatus,
  type RegisterResponse,
  type RegisterRequest,
  type LoginRequest,
  type RefreshTokensRequest,
  type RefreshTokensResponse,
  type ProfileRequest,
  type ProfileResponse,
  type Role,
} from "@sorokchat-messenger/microservices";
import { GrpcException } from "@nestjs/microservices";
import { AuthorizationCodes, UserCodes } from "@sorokchat-messenger/contracts";

describe("AuthorizationService", () => {
  let service: AuthorizationService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorizationService,
        MOCK_PASSWORD_SECRET_PROVIDER,
        MOCK_SIGNING_PROVIDER,
        MOCK_USERS_REPOSITORY_PROVIDER,
        UsersService,
      ],
    }).compile();

    service = module.get<AuthorizationService>(AuthorizationService);
    usersService = module.get<UsersService>(UsersService);
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
    const expected: RegisterResponse = {
      accessToken: newUser.login,
      refreshToken: newUser.login,
    };
    expect(service.register(newUser)).resolves.toStrictEqual(expected);
  });

  it("should success login if login and password correct", async () => {
    const newUser: RegisterRequest = {
      login: "andrey",
      password: "password",
    };
    await usersService.create(newUser);
    const expected: RegisterResponse = {
      accessToken: newUser.login,
      refreshToken: newUser.login,
    };
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
    const refreshTokenRequest: RefreshTokensRequest = {
      refreshToken: "refresh",
    };
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
    await usersService.create(newUser);
    const refreshTokenRequest: RefreshTokensRequest = {
      refreshToken: newUser.login,
    };
    const expected: RefreshTokensResponse = {
      accessToken: newUser.login,
      refreshToken: newUser.login,
    };
    expect(service.refreshTokens(refreshTokenRequest)).resolves.toStrictEqual(
      expected,
    );
  });

  it("should throw exception on profile if user not found", async () => {
    const profileRequest: ProfileRequest = {
      accessToken: "access",
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
    const profileRequest: ProfileRequest = {
      accessToken: user.login,
    };
    const expected: ProfileResponse = {
      login: user.login,
      password: user.hashedPassword,
      role: user.role as Role,
      displayName: user.displayName,
    };
    expect(service.profile(profileRequest)).resolves.toStrictEqual(expected);
  });
});
