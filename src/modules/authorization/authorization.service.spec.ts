import { Test, TestingModule } from "@nestjs/testing";
import { AuthorizationService } from "./authorization.service.js";
import { UsersService } from "../users/users.service.js";
import {
  MOCK_PASSWORD_SECRET_PROVIDER,
  MOCK_SIGNING_PROVIDER,
  MOCK_USERS_REPOSITORY_PROVIDER,
} from "../../../test/index.js";

describe("AuthorizationService", () => {
  let service: AuthorizationService;

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
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
