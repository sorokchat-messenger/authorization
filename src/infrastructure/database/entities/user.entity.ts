import { Role } from "@sorokchat-messenger/contracts";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "users" })
export class UserEntity {
  @PrimaryGeneratedColumn("increment")
  public id: number;

  @Column({ nullable: false, unique: true, type: "varchar" })
  public login: string;

  @Column({ nullable: false, type: "varchar" })
  public password: string;

  @Column({ nullable: false, type: "varchar" })
  public displayName: string;

  @Column({ nullable: false, default: Role.USER, enum: Role, type: "varchar" })
  public role: Role;
}
