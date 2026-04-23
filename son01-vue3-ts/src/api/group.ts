import request from "@/utils/request";

// 创建群聊
export const createGroupAPI = (data: any) => {
  return request.post("/api/groupCreate", data);
};

// 查询群聊
export const getGroupListAPI = (groupName: string) => {
  return request.get("/api/groupList", { params: { groupName } });
};

// 查询已加入的群聊
export const getJoinedGroupListAPI = () => {
  return request.get("/api/groupOwnerInner");
};

// 删除群聊
export const deleteGroupAPI = (groupId: number) => {
  return request.post(`/api/groupDelete/${groupId}`);
};

// 加入群聊
export const joinGroupAPI = (groupId: number) => {
  return request.post(`/api/groupAddMember/${groupId}`);
};

// 获取群聊/私聊记录
export const getGroupMsgAPI = (groupId: number) => {
  return request.get(`/api/groupChatRecord/${groupId}`);
};

// 退出群聊操作
export const exitGroupAPI = (groupId: number) => {
  return request.post(`/api/groupDeleteMember/${groupId}`);
};
