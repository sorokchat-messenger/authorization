import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../entities/index.js";
import { Repository } from "typeorm";
import { UserModel } from "../../../modules/users/user.model.js";

@Injectable()
export class UsersRepository {
  public constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  public async save(user: UserModel): Promise<UserModel> {
    const entity = this.toEntity(user);
    const saved = await this.repository.save(entity);
    return this.toModel(saved);
  }

  public async getById(id: number): Promise<UserModel | null> {
    const user = await this.repository.findOneBy({ id });
    if (user === null) return null;
    return this.toModel(user);
  }

  public async delete(id: number): Promise<void> {
    await this.repository.delete({ id });
  }

  private toEntity(model: UserModel): UserEntity {
    return {
      id: model.id === 0 ? undefined! : model.id,
      login: model.login,
      password: model.hashedPassword,
      displayName: model.displayName,
      role: model.role,
    };
  }

  private toModel(entity: UserEntity): UserModel {
    return UserModel.fromStorage(
      entity.id,
      entity.login,
      entity.password,
      entity.displayName,
      entity.role,
    );
  }
}
