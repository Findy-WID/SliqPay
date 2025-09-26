import { User } from "@prisma/client";

export function publicUser(user: User) {
  const { password, ...publicUser } = user;
  return publicUser;
}
