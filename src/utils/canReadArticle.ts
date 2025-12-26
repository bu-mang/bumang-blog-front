import { useAuthStore } from "@/store/auth";
import { RoleType } from "@/types";

type RoleScore = Exclude<RoleType, null> & "guest";

export const useCheckPermission = (readPermission: RoleType) => {
  const user = useAuthStore((state) => state.user);

  const permissionScore: Record<RoleScore, number> = {
    guest: 0,
    user: 1,
    admin: 2,
    owner: 3,
  };

  return (
    permissionScore[(user?.role ?? "guest") as RoleScore] >=
    permissionScore[(readPermission ?? "guest") as RoleScore]
  );
};
