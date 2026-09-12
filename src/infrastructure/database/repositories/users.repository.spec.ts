import { Test, TestingModule } from "@nestjs/testing";
import { UsersRepository } from "./users.repository.js";
import { getRepositoryToken } from "@nestjs/typeorm";
import { UserEntity } from "../entities/index.js";
import { Repository } from "typeorm";

const repositoryMock = {
  save: vi.fn(),
  findOneBy: vi.fn(),
  delete: vi.fn(),
} satisfies Partial<Repository<UserEntity>>;

describe("UsersRepository", () => {
  let repository: UsersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        { provide: getRepositoryToken(UserEntity), useValue: repositoryMock },
      ],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);
  });

  it("should be defined", () => {
    expect(repository).toBeDefined();
  });
});
