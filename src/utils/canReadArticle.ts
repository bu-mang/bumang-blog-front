import { useAuth } from "@/contexts/AuthContext";
import { RoleType } from "@/types";

type RoleScore = Exclude<RoleType, null> | "anon";

export const useCheckPermission = (readPermission: RoleType) => {
  const { user } = useAuth();

  const permissionScore: Record<RoleScore, number> = {
    anon: 0,
    guest: 1,
    member: 2,
    host: 3,
  };

  return (
    permissionScore[(user?.role ?? "anon") as RoleScore] >=
    permissionScore[(readPermission ?? "anon") as RoleScore]
  );
};
