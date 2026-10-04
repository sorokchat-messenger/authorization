import { Role, ROLE_HIERARCHY } from "@sorokchat-messenger/contracts";
import { type PasswordEncoder } from "@sorokchat-messenger/cryptography-abstractions";
import { uuidv7 } from "uuidv7";

export class UserModel {
  private static readonly HIERARCHY = ROLE_HIERARCHY;

  private readonly _id: string;
  private _login: string;
  private _password: string;
  private _displayName: string;
  private _role: Role;

  private constructor(
    id: string,
    login: string,
    password: string,
    displayName: string,
    role: Role,
  ) {
    this._id = id;
    this._login = login;
    this._password = password;
    this._displayName = displayName;
    this._role = role;
  }

  public get id(): string {
    return this._id;
  }

  public get login(): string {
    return this._login;
  }

  public set login(value: string) {
    this._login = value;
  }

  public async verifyPassword(
    service: PasswordEncoder,
    password: string,
  ): Promise<boolean> {
    return await service.verify(password, this._password);
  }

  public async changePassword(
    service: PasswordEncoder,
    password: string,
  ): Promise<void> {
    this._password = await service.encode(password);
  }

  public get displayName(): string {
    return this._displayName;
  }

  public get hashedPassword(): string {
    return this._password;
  }

  public set displayName(value: string) {
    this._displayName = value;
  }

  public get isUser(): boolean {
    return UserModel.HIERARCHY.hasRole(Role.USER, this._role);
  }

  public get isPro(): boolean {
    return UserModel.HIERARCHY.hasRole(Role.PRO, this._role);
  }

  public get isAdmin(): boolean {
    return UserModel.HIERARCHY.hasRole(Role.ADMIN, this._role);
  }

  public get role(): Role {
    return this._role;
  }

  public set role(role: Role) {
    this._role = role;
  }

  public static async create(
    login: string,
    password: string,
    passwordService: PasswordEncoder,
    displayName?: string,
  ): Promise<UserModel> {
    const signedPassword: string = await passwordService.encode(password);
    return new UserModel(uuidv7(), login, signedPassword, displayName || login, Role.USER);
  }

  public static fromStorage(
    id: string,
    login: string,
    password: string,
    displayName: string,
    role: Role,
  ): UserModel {
    return new UserModel(id, login, password, displayName, role);
  }
}
