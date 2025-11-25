import api from "../../core/api";

export const getListConvo = async ({ limit = 10, page = 1 }) => {
    const data = await api.getPaginated("/conversations?limit=" + limit + "&page=" + page);
    return data;
};

export const pushMessage = async (message) => {
    const sessionId = localStorage.getItem("sessionId");
    const data = await api.post("/conversations/" + sessionId, { message: message });
    return data;
};

export const getEachConversation = async () => {
    const sessionId = localStorage.getItem("sessionId");
    const data = await api.get("/conversations/" + sessionId);
    return data;
};
