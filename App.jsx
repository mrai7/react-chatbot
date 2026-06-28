import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function EcoRewardsChat() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi 👋 I'm EcoBot. Ask me anything about recycling or rewards.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const renderMarkdown = (text) => {
    if (!text) return null;
    const lines = text.split("\n");
    
    return lines.map((line, index) => {
      const trimmed = line.trim();
      
      if (trimmed.startsWith("###")) {
        return (
          <h3 key={index} style={styles.sectionHeader}>
            {trimmed.replace("###", "").trim()}
          </h3>
        );
      }
      
      if (trimmed.startsWith("##")) {
        return (
          <h3 key={index} style={styles.sectionHeader}>
            {trimmed.replace("##", "").trim()}
          </h3>
        );
      }

      if (trimmed.startsWith("*") || trimmed.startsWith("-")) {
        const rawContent = trimmed.substring(1).trim();
        return (
          <div key={index} style={styles.bulletRow}>
            <span style={styles.bulletDot}>•</span>
            <span style={styles.bulletText}>{parseInlineBold(rawContent)}</span>
          </div>
        );
      }

      if (trimmed) {
        return (
          <p key={index} style={styles.paragraphLine}>
            {parseInlineBold(trimmed)}
          </p>
        );
      }

      return <div key={index} style={{ height: "8px" }} />;
    });
  };

  const parseInlineBold = (text) => {
    const parts = text.split(/\*\*([\s\S]*?)\*\*/g);
    return parts.map((part, i) => (i % 2 === 1 ? <strong key={i} style={styles.boldText}>{part}</strong> : part));
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { sender: "user", text: inputMessage, time: timestamp }]);

    const currentMessage = inputMessage;
    setInputMessage("");
    setIsTyping(true);

    try {
      const res = await axios.post("http://localhost:8083/api/chat", {
        userMessage: currentMessage,
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: res.data.reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "⚠️ EcoRewards AI server is unavailable right now. Ensure your Anypoint Studio project is actively listening on Port 8083.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.webPageWrapper}>
        <div style={styles.heroSection}>
          <h1 style={styles.heroTitle}>🌱 EcoRewards Core Dashboard</h1>
          <p style={styles.heroSubtitle}>Monitor your carbon footprint mitigation metrics live.</p>
        </div>

        {/* Floating Chat Box Panel */}
        <div style={styles.chatWindow}>
          
          {/* Header Area */}
          <div style={styles.header}>
            <div style={styles.avatarContainer}>
              <div style={styles.avatarEco}>🌱</div>
              <div style={styles.onlineStatus} />
            </div>
            <div>
              <div style={styles.headerTitle}>EcoBot</div>
              <div style={styles.headerSubtitle}>Active Now</div>
            </div>
          </div>

          {/* Deep Dark Blue Conversation Canvas */}
          <div style={styles.messageArea}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  ...styles.messageWrapper,
                  justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                }}
              >
                {msg.sender === "user" ? (
                  <div style={styles.userBubble}>
                    {msg.text}
                  </div>
                ) : (
                  <div style={styles.botCard}>
                    {renderMarkdown(msg.text)}
                    <div style={styles.timestamp}>{msg.time}</div>
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div style={styles.messageWrapper}>
                <div style={styles.botCard}>
                  <div style={{ color: "#718096", fontSize: "0.95rem" }}>💬 EcoBot is typing...</div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Dark Navy Input Panel */}
          <div style={styles.inputPanel}>
            <input
              type="text"
              placeholder="Ask EcoBot something..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              style={styles.textInput}
              disabled={isTyping}
            />
            <button
              onClick={sendMessage}
              disabled={isTyping || !inputMessage.trim()}
              style={{
                ...styles.sendButton,
                color: inputMessage.trim() ? "#3b82f6" : "#4a5568"
              }}
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#facc15", // Updated layout backdrop to a vibrant yellow
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
  },
  webPageWrapper: {
    width: "100%",
    maxWidth: "1100px",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "40px",
    flexWrap: "wrap",
  },
  heroSection: {
    flex: "1",
    minWidth: "300px",
  },
  heroTitle: {
    fontSize: "2.5rem",
    fontWeight: "800",
    color: "#1e293b", // Swapped header text to dark slate so it pops cleanly off the yellow
    marginBottom: "12px",
    lineHeight: "1.2",
  },
  heroSubtitle: {
    fontSize: "1.1rem",
    color: "#334155", // Swapped subtitle text to a readable slate color
    lineHeight: "1.5",
    fontWeight: "500",
  },
  chatWindow: {
    width: "100%",
    maxWidth: "440px",
    height: "640px",
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  header: {
    padding: "16px 20px",
    borderBottom: "1px solid #f0f0f0",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    backgroundColor: "#ffffff"
  },
  avatarContainer: {
    position: "relative",
    width: "40px",
    height: "40px",
    backgroundColor: "#edf7ed",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEco: {
    fontSize: "1.2rem",
  },
  onlineStatus: {
    position: "absolute",
    bottom: "2px",
    right: "2px",
    width: "10px",
    height: "10px",
    backgroundColor: "#4caf50",
    borderRadius: "50%",
    border: "2px solid #ffffff",
  },
  headerTitle: {
    fontWeight: "bold",
    fontSize: "1.05rem",
    color: "#1a202c",
  },
  headerSubtitle: {
    fontSize: "0.85rem",
    color: "#718096",
  },
  messageArea: {
    flex: 1,
    padding: "20px",
    overflowY: "auto",
    backgroundColor: "#0d1424", 
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  messageWrapper: {
    display: "flex",
    width: "100%",
  },
  userBubble: {
    maxWidth: "80%",
    backgroundColor: "#1e3a8a",
    color: "#ffffff",
    padding: "12px 16px",
    borderRadius: "16px",
    borderBottomRightRadius: "4px",
    fontSize: "0.95rem",
    lineHeight: "1.4",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
  },
  botCard: {
    width: "88%",
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "22px",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
  },
  sectionHeader: {
    fontSize: "1.15rem",
    fontWeight: "bold",
    color: "#1a202c",
    margin: "14px 0 10px 0",
    display: "flex",
    alignItems: "center",
  },
  bulletRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    margin: "4px 0 6px 12px",
  },
  bulletDot: {
    color: "#2d3748",
    fontSize: "1rem",
    lineHeight: "1.4",
  },
  bulletText: {
    fontSize: "0.95rem",
    color: "#2d3748",
    lineHeight: "1.4",
  },
  paragraphLine: {
    fontSize: "1rem",
    color: "#1a202c",
    margin: "14px 0",
    lineHeight: "1.4",
  },
  boldText: {
    fontWeight: "700",
    color: "#1a202c",
  },
  timestamp: {
    fontSize: "0.7rem",
    color: "#a0aec0",
    textAlign: "left",
    marginTop: "12px",
    paddingLeft: "12px"
  },
  inputPanel: {
    padding: "16px 20px",
    backgroundColor: "#0a111e", 
    display: "flex",
    alignItems: "center",
    gap: "10px",
    borderTop: "1px solid #1e293b"
  },
  textInput: {
    flex: 1,
    backgroundColor: "transparent",
    border: "none",
    color: "#ffffff",
    padding: "10px 4px",
    fontSize: "0.95rem",
    outline: "none",
  },
  sendButton: {
    backgroundColor: "transparent",
    border: "none",
    fontSize: "1.2rem",
    cursor: "pointer",
    padding: "4px",
    transition: "color 0.2s ease"
  }
};