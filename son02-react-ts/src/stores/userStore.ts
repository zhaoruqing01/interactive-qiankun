import type { GetUserInfoResponse } from "@/types/userAPI";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// 定义 Store 状态类型
interface UserState {
  userInfo: GetUserInfoResponse | null;
  token: string;
  setUserInfo: (userInfo: GetUserInfoResponse) => void;
  setToken: (token: string) => void;
  reset: () => void;
}

// 定义用户状态+修改方法
export const useUserStore = create<UserState>()(
  // 持久化存储
  persist(
    (set) => ({
      userInfo: null,
      token: "",
      setUserInfo: (userInfo) => set(() => ({ userInfo })),
      setToken: (token) => set(() => ({ token })),
      reset: () => set(() => ({ userInfo: null, token: "" })),
    }),
    {
      // 持久化存储的键名
      name: "user",
    },
  ),
);
