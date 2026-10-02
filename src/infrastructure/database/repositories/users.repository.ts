import { Injectable, Provider } from "@nestjs/common";
import { UserModel } from "../../../modules/users/user.model.js";
import {
  IUsersRepository,
  USERS_REPOSITORY_TOKEN,
} from "../../../modules/users/users.repository.interface.js";
import { PrismaService } from "../prisma/index.js";
import { Role, type User } from "../../../generated/prisma/client.js";
import { NewUser } from "../../../modules/users/new-user.type.js";

@Injectable()
export class UsersRepository implements IUsersRepository {
  public constructor(
    private readonly prisma: PrismaService
  ) { }

  public async create(user: NewUser): Promise<UserModel> {
    const saved = await this.prisma.user.create({
      data: {
        login: user.login,
        password: user.password,
        displayName: user.displayName || user.login
      }
    });
    return this.toModel(saved);
  }

  public async save(user: UserModel): Promise<UserModel> {
    const updated = await this.prisma.user.update({ where: { id: user.id }, data: this.toEntity(user) });
    return this.toModel(updated);
  }

  public async getById(id: string): Promise<UserModel | null> {
    const user = await this.prisma.user.findFirst({ where: { id } });
    if (user === null) return null;
    return this.toModel(user);
  }

  public async getByLogin(login: string): Promise<UserModel | null> {
    const user = await this.prisma.user.findFirst({ where: { login } });
    if (user === null) return null;
    return this.toModel(user);
  }

  public async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  private toEntity(model: UserModel): Omit<User, 'id'> {
    return {
      login: model.login,
      password: model.hashedPassword,
      displayName: model.displayName,
      role: model.role as Role,
    };
  }

  private toModel(entity: User): UserModel {
    return UserModel.fromStorage(
      entity.id,
      entity.login,
      entity.password,
      entity.displayName,
      entity.role,
    );
  }
}

export const USERS_REPOSITORY_PROVIDER: Provider<IUsersRepository> = {
  provide: USERS_REPOSITORY_TOKEN,
  useClass: UsersRepository,
};
