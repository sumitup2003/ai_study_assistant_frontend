import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Layout/Navbar";
import Sidebar from "../components/Layout/Sidebar";
import { Send, Loader, Bot, User } from "lucide-react";
import api from "../utils/api";
import toast from "react-hot-toast";

const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const noteId = searchParams.get("noteId");

  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(noteId || "");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    if (noteId) {
      setSelectedNoteId(noteId);
    }
  }, [noteId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchNotes = async () => {
    try {
      const { data } = await api.get("/notes");
      setNotes(data.notes);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
      toast.error("Failed to load notes");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!input.trim() || !selectedNoteId) {
      toast.error("Please select a note and enter a question");
      return;
    }

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await api.post("/chat/ask", {
        noteId: selectedNoteId,
        question: input,
      });

      const aiMessage = { role: "assistant", content: data.answer };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to get response");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 flex flex-col p-4 sm:p-8">
          <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
            <div className="mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                AI Chat
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Ask questions about your notes
              </p>
            </div>

            {/* Note Selector */}
            <div className="mb-3 sm:mb-4">
              <select
                value={selectedNoteId}
                onChange={(e) => setSelectedNoteId(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a note...</option>
                {notes.map((note) => (
                  <option key={note._id} value={note._id}>
                    {note.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Messages */}
            <div className="flex-1 bg-white rounded-lg shadow-sm p-3 sm:p-6 mb-3 sm:mb-4 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Bot className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>Select a note and start asking questions!</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`flex items-start space-x-2 max-w-[80%] ${
                          message.role === "user"
                            ? "flex-row-reverse space-x-reverse"
                            : ""
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            message.role === "user"
                              ? "bg-blue-600"
                              : "bg-gray-200"
                          }`}
                        >
                          {message.role === "user" ? (
                            <User className="w-5 h-5 text-white" />
                          ) : (
                            <Bot className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                        <div
                          className={`px-4 py-2 rounded-lg ${
                            message.role === "user"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="flex items-start space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <Bot className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="px-4 py-2 rounded-lg bg-gray-100">
                          <Loader className="w-5 h-5 text-gray-600 animate-spin" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            {/* Input */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                disabled={!selectedNoteId || loading}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
              <button
                type="submit"
                disabled={!selectedNoteId || loading || !input.trim()}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};
export default ChatPage;
