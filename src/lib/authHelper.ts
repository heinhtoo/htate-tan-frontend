/* eslint-disable @typescript-eslint/no-explicit-any */
import type { UserDetails } from "@/store/authStore";

export function isAdmin(session: UserDetails | undefined) {
  return session?.isAdmin;
}

export function getRole(session: UserDetails | undefined) {
  return session?.isAdmin ? "Admin" : "Staff";
}
