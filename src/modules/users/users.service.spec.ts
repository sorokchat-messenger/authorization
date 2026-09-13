import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service.js";
import {
  MOCK_PASSWORD_SECRET_PROVIDER,
  MOCK_SIGNING_PROVIDER,
  MOCK_USERS_REPOSITORY_PROVIDER,
} from "../../../test/index.js";
import {
  Role,
  UserCodes,
  type NewUserPayload,
} from "@sorokchat-messenger/contracts";
import { UserModel } from "./user.model.js";
import { ISigning } from "@sorokchat-messenger/cryptography-abstractions";
import {
  PASSWORD_SECRET_TOKEN,
  SIGNING_TOKEN,
} from "../../infrastructure/index.js";
import {
  IUsersRepository,
  USERS_REPOSITORY_TOKEN,
} from "./users.repository.interface.js";
import { GrpcException } from "@nestjs/microservices";
import { GrpcStatus } from "@sorokchat-messenger/microservices";

describe("UsersService", () => {
  let service: UsersService;
  let secret: string;
  let signing: ISigning;
  let repository: IUsersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        MOCK_PASSWORD_SECRET_PROVIDER,
        MOCK_USERS_REPOSITORY_PROVIDER,
        MOCK_SIGNING_PROVIDER,
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    secret = module.get<string>(PASSWORD_SECRET_TOKEN);
    signing = module.get<ISigning>(SIGNING_TOKEN);
    repository = module.get<IUsersRepository>(USERS_REPOSITORY_TOKEN);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should success create new user without display name", async () => {
    const payload: NewUserPayload = {
      login: "andrey",
      password: "password",
    };

    const expected = UserModel.fromStorage(
      1,
      payload.login,
      await signing.sign(payload.password, secret),
      payload.login,
      Role.USER,
    );
    const result = await service.create(payload);
    expect(result).toStrictEqual(expected);
  });

  it("should success create new user with display name", async () => {
    const payload: Required<NewUserPayload> = {
      login: "andrey",
      password: "password",
      displayName: "Сороковський Андрій",
    };

    const expected = UserModel.fromStorage(
      1,
      payload.login,
      await signing.sign(payload.password, secret),
      payload.displayName,
      Role.USER,
    );
    const result = await service.create(payload);
    expect(result).toStrictEqual(expected);
  });

  it("should throw exception if user already exists", async () => {
    const payload: Required<NewUserPayload> = {
      login: "andrey",
      password: "password",
      displayName: "Сороковський Андрій",
    };

    const user = UserModel.fromStorage(
      1,
      payload.login,
      await signing.sign(payload.password, secret),
      payload.displayName,
      Role.USER,
    );
    const expected = new GrpcException(
      UserCodes.EXISTS,
      GrpcStatus.ALREADY_EXISTS,
    );
    await repository.save(user);
    expect(service.create(payload)).rejects.toStrictEqual(expected);
  });
});
