import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service.js";
import {
  MOCK_PASSWORD_SECRET_PROVIDER,
  MOCK_SIGNING_PROVIDER,
  MOCK_USERS_REPOSITORY_PROVIDER,
} from "../../../test/index.js";

describe("UsersService", () => {
  let service: UsersService;

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
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
