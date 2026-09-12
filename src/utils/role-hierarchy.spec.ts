import { RoleHierarchy } from "./role-hierarchy.util.js";

const USER: string = "USER";
const PRO: string = "PRO";
const ADMIN: string = "ADMIN";

describe("Role Hierarchy tests", () => {
  let hierarchy: RoleHierarchy;

  beforeAll(() => {
    hierarchy = new RoleHierarchy(
      new Map<string, string[]>([
        [USER, []],
        [PRO, [USER]],
        [ADMIN, [PRO]],
      ]),
    );
  });

  it(`returns false if needUser = ${ADMIN}, currentUser = ${PRO}`, () => {
    const result = hierarchy.hasRole(ADMIN, PRO);
    expect(result).toBeFalsy();
  });

  it(`returns false if needUser = ${ADMIN}, currentUser = ${USER}`, () => {
    const result = hierarchy.hasRole(ADMIN, USER);
    expect(result).toBeFalsy();
  });

  it(`returns false if needUser = ${ADMIN}, currentUser = ${ADMIN}`, () => {
    const result = hierarchy.hasRole(ADMIN, ADMIN);
    expect(result).toBeTruthy();
  });

  it("returns false if role not found", () => {
    const result = hierarchy.hasRole(ADMIN, "TEST");
    expect(result).toBeFalsy();
  });

  it(`returns false if needUser = ${PRO}, currentUser = ${ADMIN}`, () => {
    const result = hierarchy.hasRole(PRO, ADMIN);
    expect(result).toBeTruthy();
  });
});
