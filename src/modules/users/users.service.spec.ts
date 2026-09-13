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

  it("should throw error when get by id if not found", async () => {
    const expected = new GrpcException(
      UserCodes.NOT_FOUND,
      GrpcStatus.NOT_FOUND,
    );
    expect(service.getById(1)).rejects.toStrictEqual(expected);
  });

  it("should success return user when get by id existed user", async () => {
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
    await repository.save(expected);
    expect(service.getById(1)).resolves.toStrictEqual(expected);
  });

  it("should throw error when get by login if not found", async () => {
    const expected = new GrpcException(
      UserCodes.NOT_FOUND,
      GrpcStatus.NOT_FOUND,
    );
    expect(service.getByLogin("test")).rejects.toStrictEqual(expected);
  });

  it("should success return user when get by login existed user", async () => {
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
    await repository.save(expected);
    expect(service.getByLogin(payload.login)).resolves.toStrictEqual(expected);
  });

  it("should throws error on update if login exists", async () => {
    const created = await UserModel.create(
      "andrey",
      "password",
      signing,
      secret,
    );
    const firstUser = await UserModel.create(
      created.login,
      created.hashedPassword,
      signing,
      secret,
    );
    const secondUser = await UserModel.create(
      created.login + "s",
      created.hashedPassword,
      signing,
      secret,
    );
    await repository.save(firstUser);
    const updatedUser = await repository.save(secondUser);
    updatedUser.login = created.login;
    const expected = new GrpcException(
      UserCodes.EXISTS,
      GrpcStatus.ALREADY_EXISTS,
    );
    expect(service.update(updatedUser)).rejects.toStrictEqual(expected);
  });

  it("should success update user if exists", async () => {
    const created = await UserModel.create(
      "andrey",
      "password",
      signing,
      secret,
    );
    const user = await UserModel.create(
      created.login,
      created.hashedPassword,
      signing,
      secret,
    );
    const expected = await repository.save(user);
    expected.displayName = "Андрій";
    expect(service.update(expected)).resolves.toStrictEqual(expected);
  });

  it("should success delete user", async () => {
    const created = await UserModel.create(
      "andrey",
      "password",
      signing,
      secret,
    );
    const user = await UserModel.create(
      created.login,
      created.hashedPassword,
      signing,
      secret,
    );
    const savedUser = await repository.save(user);
    const expected = new GrpcException(
      UserCodes.NOT_FOUND,
      GrpcStatus.NOT_FOUND,
    );
    await service.delete(savedUser.id);
    expect(service.getById(savedUser.id)).rejects.toStrictEqual(expected);
  });

  it("should throw exception on delete user if not exists", async () => {
    const expected = new GrpcException(
      UserCodes.NOT_FOUND,
      GrpcStatus.NOT_FOUND,
    );
    expect(service.getById(1)).rejects.toStrictEqual(expected);
  });
});
