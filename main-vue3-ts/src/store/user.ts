// 用户模块
import { defineStore } from "pinia";
import { ref } from "vue";

// 定义用户类型
interface User {
  username?: string;
  [key: string]: any;
}

// 定义用户模块
export const useUserStore = defineStore(
  "user",
  () => {
    const userInfo = ref<User>();
    const token = ref("");

    // 存储token
    function setToken(newToken: string) {
      token.value = newToken;
    }
    // 存储用户信息
    function setUserInfo(newUserInfo: any) {
      userInfo.value = newUserInfo;
    }
    // 清理user信息
    function clearUserInfo() {
      userInfo.value = {};
      token.value = "";
    }
    return {
      userInfo,
      token,
      setToken,
      setUserInfo,
      clearUserInfo,
    };
  },
  {
    persist: true,
  },
);
