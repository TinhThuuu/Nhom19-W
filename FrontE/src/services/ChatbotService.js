import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

const getHeaders = () => {
  const token = localStorage.getItem("access_token");
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const ChatbotService = {
  async sendMessage(message, userId = null, sessionId = null) {
    try {
      const response = await axios.post(`${API_URL}/chatbot/chat`, {
        message,
        userId,
        sessionId,
      });
      return response.data.response;
    } catch (error) {
      console.error("Error calling chatbot API:", error);
      throw new Error("Không thể kết nối đến chatbot. Vui lòng thử lại.");
    }
  },

  async getHistory(id) {
    try {
      const response = await axios.get(`${API_URL}/chatbot/history/${id}`, getHeaders());
      return response.data.messages || [];
    } catch (error) {
      console.error("Error fetching chatbot history:", error);
      return [];
    }
  },

  async clearHistory(id) {
    try {
      const response = await axios.delete(`${API_URL}/chatbot/clear/${id}`, getHeaders());
      return response.data;
    } catch (error) {
      console.error("Error clearing chatbot history:", error);
      throw new Error("Không thể xóa lịch sử hội thoại.");
    }
  }
};

export default ChatbotService;
