import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service.js";
import {
  MOCK_PASSWORD_SECRET_PROVIDER,
  MOCK_SIGNING_PROVIDER,
  MOCK_USERS_REPOSITORY_PROVIDER,
} from "../../../test/index.js";
import { Role, type NewUserPayload } from "@sorokchat-messenger/contracts";
import { UserModel } from "./user.model.js";
import { ISigning } from "@sorokchat-messenger/cryptography-abstractions";
import {
  PASSWORD_SECRET_TOKEN,
  SIGNING_TOKEN,
} from "../../infrastructure/index.js";

describe("UsersService", () => {
  let service: UsersService;
  let secret: string;
  let signing: ISigning;

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
});
