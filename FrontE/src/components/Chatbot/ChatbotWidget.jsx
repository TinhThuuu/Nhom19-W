import React, { useState, useEffect, useRef } from "react";
import { Avatar, List, Input, Button, Card, Spin, Modal } from "antd";
import { MessageOutlined, SendOutlined, DeleteOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import ChatbotService from "../../services/ChatbotService";
import "./ChatbotWidget.css";

const ChatbotWidget = () => {
  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const user = useSelector(state => state.user);
  const userId = user?.id || null;

  const toggleVisible = () => setVisible(!visible);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getSessionId = () => {
    let sid = sessionStorage.getItem("chatbot_session_id");
    if (!sid) {
      sid = "sess_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem("chatbot_session_id", sid);
    }
    return sid;
  };

  const loadHistory = async () => {
    const identifier = userId || getSessionId();
    if (!identifier) return;
    try {
      const dbHistory = await ChatbotService.getHistory(identifier);
      const normalized = dbHistory.map(msg => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content
      }));
      setMessages(normalized);
    } catch (err) {
      console.error("Failed to load chat history:", err);
    }
  };

  useEffect(() => {
    if (visible) {
      loadHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };

    setMessages(prev => {
      const newMsgs = [...prev, userMsg];
      return newMsgs.length > 100 ? newMsgs.slice(newMsgs.length - 100) : newMsgs;
    });

    const currentInput = input;
    setInput("");
    setLoading(true);

    try {
      const response = await ChatbotService.sendMessage(currentInput, userId, getSessionId());
      const aiMsg = { role: "assistant", content: response };
      setMessages(prev => {
        const newMsgs = [...prev, aiMsg];
        return newMsgs.length > 100 ? newMsgs.slice(newMsgs.length - 100) : newMsgs;
      });
    } catch (err) {
      const errMsg = {
        role: "assistant",
        content: "Xin lỗi, hiện tại tôi đang gặp sự cố kết nối. Vui lòng thử lại sau hoặc liên hệ hotline cửa hàng nhé!"
      };
      setMessages(prev => {
        const newMsgs = [...prev, errMsg];
        return newMsgs.length > 100 ? newMsgs.slice(newMsgs.length - 100) : newMsgs;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    Modal.confirm({
      title: "Xác nhận xóa lịch sử",
      content: "Bạn có chắc chắn muốn xóa toàn bộ lịch sử cuộc trò chuyện này không?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        const identifier = userId || getSessionId();
        if (!identifier) return;
        try {
          await ChatbotService.clearHistory(identifier);
          setMessages([]);
        } catch (err) {
          console.error("Failed to clear chat history:", err);
        }
      }
    });
  };

  const handleKeyPress = e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessageContent = (text) => {
    if (!text) return "";

    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    let inList = false;
    const lines = html.split('\n');
    const formattedLines = lines.map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const content = trimmed.substring(2);
        if (!inList) {
          inList = true;
          return `<ul><li>${content}</li>`;
        }
        return `<li>${content}</li>`;
      } else {
        if (inList) {
          inList = false;
          return `</ul>${line}`;
        }
        return line;
      }
    });

    if (inList) {
      formattedLines.push('</ul>');
    }

    html = formattedLines.join('\n');

    html = html.replace(/\n/g, "<br/>");

    return html;
  };

  return (
    <div className="chatbot-widget">
      <Button
        shape="circle"
        icon={<MessageOutlined />}
        className={`chatbot-toggle ${visible ? 'active' : ''}`}
        onClick={toggleVisible}
      />
      {visible && (
        <Card
          className="chatbot-card"
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span role="img" aria-label="robot">🤖</span>
              <span>AI Shopping Assistant</span>
            </div>
          }
          extra={
            messages.length > 0 && (
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
                onClick={handleClear}
                className="chatbot-clear-btn"
              >
                Xóa lịch sử
              </Button>
            )
          }
          bordered={false}
        >
          <div className="chatbot-messages">
            {messages.length === 0 ? (
              <div className="chatbot-welcome">
                <Avatar size={64} icon={<MessageOutlined />} style={{ backgroundColor: '#764ba2', marginBottom: 16 }} />
                <h3>Xin chào! 👋</h3>
                <p>Tôi là trợ lý ảo AI của DT-Shop. Hãy hỏi tôi bất cứ thông tin nào về các sản phẩm điện thoại, so sánh cấu hình hoặc hướng dẫn thanh toán nhé!</p>
              </div>
            ) : (
              <List
                dataSource={messages}
                renderItem={msg => (
                  <List.Item className={msg.role === "user" ? "user-msg" : "ai-msg"}>
                    {msg.role !== "user" && <Avatar icon={<MessageOutlined />} className="chatbot-ai-avatar" />}
                    <div className="msg-content" dangerouslySetInnerHTML={{ __html: formatMessageContent(msg.content) }} />
                  </List.Item>
                )}
              />
            )}
            {loading && (
              <div className="typing-indicator">
                <Spin size="small" /> <span>Đang trả lời...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="chatbot-input-area">
            <Input.TextArea
              rows={2}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập câu hỏi của bạn..."
              disabled={loading}
              style={{ resize: 'none' }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              disabled={loading || !input.trim()}
            >
              Gửi
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ChatbotWidget;
