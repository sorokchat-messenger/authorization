import { Test, TestingModule } from "@nestjs/testing";
import { UsersRepository } from "./users.repository.js";
import { getRepositoryToken } from "@nestjs/typeorm";
import { UserEntity } from "../entities/index.js";
import { DeepPartial } from "typeorm";
import { UserModel } from "../../../modules/users/user.model.js";
import { ISigning } from "@sorokchat-messenger/cryptography-abstractions";
import { Role } from "@sorokchat-messenger/contracts";
import {
  MOCK_PASSWORD_SECRET_PROVIDER,
  MOCK_SIGNING_PROVIDER,
} from "../../../../test/index.js";
import {
  PASSWORD_SECRET_TOKEN,
  SIGNING_TOKEN,
} from "../../cryptography/index.js";

let users: UserEntity[];

const repositoryMock = {
  save: vi.fn(async (user: UserEntity): Promise<UserEntity> => {
    const index = users.findIndex((item) => item.id === user.id);
    if (index >= 0) {
      users[index] = user;
      return users[index];
    } else {
      user.id = users.length + 1;
      users.push(user);
      return user;
    }
  }),
  findOneBy: vi.fn(
    async ({ id }: DeepPartial<UserEntity>): Promise<UserEntity | null> => {
      return users.find((user) => user.id === id) || null;
    },
  ),
  delete: vi.fn(async ({ id }: DeepPartial<UserEntity>): Promise<void> => {
    users = users.filter((user) => user.id !== id);
  }),
} as const;

describe("UsersRepository", () => {
  let repository: UsersRepository;
  let secret: string;
  let signingService: ISigning;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        { provide: getRepositoryToken(UserEntity), useValue: repositoryMock },
        MOCK_SIGNING_PROVIDER,
        MOCK_PASSWORD_SECRET_PROVIDER,
      ],
    }).compile();
    users = [];
    repository = module.get<UsersRepository>(UsersRepository);
    signingService = module.get<ISigning>(SIGNING_TOKEN);
    secret = module.get<string>(PASSWORD_SECRET_TOKEN);
  });

  it("should be defined", () => {
    expect(repository).toBeDefined();
  });

  it("should success save new user", async () => {
    const user = await UserModel.create(
      "andrey",
      "password",
      signingService,
      secret,
    );
    const expected = UserModel.fromStorage(
      1,
      user.login,
      user.hashedPassword,
      user.displayName,
      user.role,
    );
    const result = await repository.save(user);
    expect(result).toStrictEqual(expected);
  });

  it("should success save existed user", async () => {
    const oldUser = UserModel.fromStorage(
      1,
      "andrey",
      "password",
      "sorokovsky_andrey",
      Role.USER,
    );
    await repository.save(oldUser);
    const updatedUser = UserModel.fromStorage(
      1,
      "andrey",
      "password",
      "andrey",
      Role.USER,
    );
    const result = await repository.save(updatedUser);
    expect(result).toStrictEqual(updatedUser);
  });

  it("should success return user if existed", async () => {
    const user = await UserModel.create(
      "andrey",
      "password",
      signingService,
      secret,
    );
    const expected = await repository.save(user);
    const result = await repository.getById(1);
    expect(result).toStrictEqual(expected);
  });

  it("should success return null if not existed", async () => {
    const result = await repository.getById(1);
    expect(result).toBeNull();
  });

  it("should success delete", async () => {
    const user = await UserModel.create(
      "andrey",
      "password",
      signingService,
      secret,
    );
    const savedUser = await repository.save(user);
    const foundedUser = await repository.getById(savedUser.id);
    expect(foundedUser).toStrictEqual(savedUser);
    await repository.delete(savedUser.id);
    const userAfterDelete = await repository.getById(savedUser.id);
    expect(userAfterDelete).toBeNull();
  });
});
