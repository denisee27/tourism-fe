import api from "../../../core/api";

export const convoSession = async () => {
  const res = await api.post("/conversations");
  return res;
};

export const createConvo = async (data, sessionId) => {
  const jsonString = JSON.stringify(data);
  const res = await api.post("/conversations/" + sessionId, { message: jsonString });
  console.log("createConvo", res);
  return res.plainText;
};

export const getKeyPoint = async () => {
  const sessionId = localStorage.getItem("sessionId");
  const res = await api.get("/conversations/" + sessionId + "/detail");
  return res;
};
