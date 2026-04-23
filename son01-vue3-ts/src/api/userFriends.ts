import request from "@/utils/request";

/**
 * 查询所有用户列表
 * @param
 * @returns
 */
export const getAllUsersAPI = (username: string) => {
  return request.get(`/api/allFriends/${username}`);
};

/**
 * 查询用户历史申请
 * @param userId
 * @returns
 */
export const getApplyHistoryAPI = (userId: number) => {
  return request.get(`/api/historyApply/${userId}`);
};

/**
 * 查询用户好友列表
 * @param userId
 * @returns
 */
export const getFriendListAPI = (userId: number) => {
  return request.get(`/api/friendsList/${userId}`);
};

/**
 * 查询用户好友聊天记录
 * @param userId
 * @param friendUserId
 * @returns
 */
export const getFriendChatHistoryAPI = (
  userId: number,
  friendUserId: number,
) => {
  return request.get(`/api/chatHistory/${userId}/${friendUserId}`);
};
