import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosclient";
import { Send } from "lucide-react";

function ChatAi({ problem }) {
  const [messages, setMessages] = useState([
    {
      role: "model",
      parts: [
        {
          text: `👋 Hi there! I'm your personal Assistant Bot.
         I'm here to help you solve coding problems, step-by-step`,
        },
      ],
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const parseMessage = (text) => {
    const parts = [];
    let remainingText = text;

    while (remainingText.length > 0) {
      const codeStart = remainingText.indexOf("$");
      if (codeStart === -1) {
        parts.push({ type: "text", content: remainingText });
        break;
      }

      if (codeStart > 0) {
        parts.push({
          type: "text",
          content: remainingText.substring(0, codeStart),
        });
      }

      remainingText = remainingText.substring(codeStart + 1);
      const codeEnd = remainingText.indexOf("$");

      if (codeEnd === -1) {
        parts.push({ type: "text", content: "$" + remainingText });
        break;
      }

      const codeContent = remainingText.substring(0, codeEnd);
      parts.push({ type: "code", content: codeContent });
      remainingText = remainingText.substring(codeEnd + 1);
    }

    return parts;
  };

  const onSubmit = async (data) => {
    const userMessage = { role: "user", parts: [{ text: data.message }] };

    setMessages((prev) => [...prev, userMessage]);
    reset();
    setIsLoading(true);

    try {
      const messagesForApi = [
        ...messages.map((msg) => ({
          role: msg.role,
          parts: msg.parts.map((part) => ({ text: part.text })),
        })),
        userMessage,
      ];

      const response = await axiosClient.post("/ai/chat", {
        messages: messagesForApi,
        title: problem.title,
        description: problem.description,
        testCases: problem.visibletestcases,
        startCode: problem.startcode,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          parts: [{ text: response.data.message }],
        },
      ]);
    } catch (error) {
      console.error("API Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          parts: [{ text: "Sorry, I encountered an error. Please try again." }],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-[80vh] min-h-[500px] bg-gray-900 text-gray-100 text-sm">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[100%] whitespace-pre-wrap rounded-lg px-4 py-3 shadow-md ${
                msg.role === "user"
                  ? "bg-blue-700 text-gray-100"
                  : "bg-gray-800 text-gray-200"
              }`}
            >
              {parseMessage(msg.parts[0].text).map((part, i) => {
                if (part.type === "code") {
                  return (
                    <div key={i} className="my-2">
                      <div className="bg-gray-950 rounded-lg p-4 text-xs font-mono whitespace-pre overflow-x-auto text-gray-100 border border-gray-700">
                        {part.content.split("\n").map((line, lineIndex) => (
                          <div key={lineIndex} className="flex">
                            <span className="flex-1">{line}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return (
                  <span key={i} className="text-current">
                    {part.content}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-gray-300 rounded-lg px-4 py-2">
              <span className="loading loading-dots loading-md"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input box */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="sticky bottom-0 p-4 bg-gray-800 border-t border-gray-700"
      >
        <div className="flex items-center gap-2">
          <input
            placeholder="Ask me anything..."
            className="flex-1 bg-gray-700 text-gray-100 rounded-md px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
            {...register("message", { required: true, minLength: 2 })}
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-md text-gray-100 transition disabled:opacity-50"
            disabled={errors.message || isLoading}
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChatAi;
