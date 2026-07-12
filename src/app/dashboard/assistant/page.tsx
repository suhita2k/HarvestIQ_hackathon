"use client";

import * as React from "react";
import { Bot, Send, Plus, Search, Trash2, Copy, Share2, Save, MessageSquare } from "lucide-react";
import { Button, Card, Input, Textarea, Skeleton, EmptyState } from "@/components/ui";
import { useApp } from "@/components/Providers";
import toast from "react-hot-toast";
import { formatDateTime } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: string;
}

const SUGGESTIONS = [
  "Which crop should I grow this season?",
  "What's the best fertilizer for tomatoes?",
  "How do I control aphids organically?",
  "How can I improve my soil fertility?",
  "What's the best irrigation schedule for rice?",
];

export default function AssistantPage() {
  const { language, t } = useApp();
  const [chats, setChats] = React.useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [loadingChats, setLoadingChats] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const loadChats = React.useCallback(async () => {
    try {
      const res = await fetch("/api/ai/chats");
      const data = await res.json();
      setChats(data.chats ?? []);
    } catch {
      // ignore
    } finally {
      setLoadingChats(false);
    }
  }, []);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadChats();
  }, [loadChats]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const newChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setInput("");
  };

  const selectChat = (chat: Chat) => {
    setCurrentChatId(chat.id);
    setMessages(chat.messages ?? []);
  };

  const deleteChat = async (chatId: string) => {
    if (!confirm("Delete this chat?")) return;
    try {
      await fetch(`/api/ai/chats?id=${chatId}`, { method: "DELETE" });
      if (currentChatId === chatId) newChat();
      await loadChats();
      toast.success("Chat deleted");
    } catch {
      toast.error("Failed to delete chat");
    }
  };

  const saveChat = async () => {
    if (messages.length === 0) {
      toast.error("No messages to save");
      return;
    }
    const title = messages[0]?.content.slice(0, 50) ?? "Untitled Chat";
    try {
      const res = await fetch("/api/ai/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId: currentChatId, title, messages }),
      });
      const data = await res.json();
      if (data.chat?.id) setCurrentChatId(data.chat.id);
      await loadChats();
      toast.success("Chat saved");
    } catch {
      toast.error("Failed to save chat");
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      createdAt: new Date().toISOString(),
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const history = updatedMessages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-language": language,
        },
        body: JSON.stringify({ message: userMessage.content, history: history.slice(0, -1) }),
      });
      const data = await res.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.content ?? t("msg_error"),
        createdAt: new Date().toISOString(),
      };
      setMessages([...updatedMessages, assistantMessage]);
    } catch {
      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: t("msg_error"),
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success(t("msg_copied"));
  };

  const shareMessage = (content: string) => {
    if (navigator.share) {
      navigator.share({ title: "HarvestIQ AI Response", text: content }).catch(() => {});
    } else {
      navigator.clipboard.writeText(content);
      toast.success("Copied to clipboard for sharing");
    }
  };

  const filteredChats = chats.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Sidebar - Chat History */}
      <Card className="hidden w-72 shrink-0 flex-col p-0 md:flex">
        <div className="border-b border-slate-100 p-3 dark:border-slate-800">
          <Button onClick={newChat} className="w-full" size="sm">
            <Plus className="h-4 w-4" /> {t("btn_new_chat")}
          </Button>
        </div>
        <div className="border-b border-slate-100 p-3 dark:border-slate-800">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="py-1.5 pl-8 text-xs"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {loadingChats ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredChats.length === 0 ? (
            <p className="p-4 text-center text-xs text-slate-400">No chats yet</p>
          ) : (
            <ul className="space-y-1">
              {filteredChats.map((chat) => (
                <li key={chat.id}>
                  <button
                    onClick={() => selectChat(chat)}
                    className={`group flex w-full items-start gap-2 rounded-lg p-2 text-left text-sm transition ${
                      currentChatId === chat.id
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <MessageSquare className="mt-0.5 h-4 w-4 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{chat.title}</p>
                      <p className="text-[10px] text-slate-400">{formatDateTime(chat.updatedAt)}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
                      className="opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-400 hover:text-red-600" />
                    </button>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      {/* Chat Area */}
      <div className="flex flex-1 flex-col">
        <Card className="flex flex-1 flex-col p-0">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 p-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 text-white">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">AI Farming Assistant</p>
                <p className="text-xs text-emerald-600">● Online · Powered by Groq AI</p>
              </div>
            </div>
            {messages.length > 0 && (
              <Button onClick={saveChat} size="sm" variant="outline">
                <Save className="h-3.5 w-3.5" /> Save
              </Button>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg">
                  <Bot className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Ask me anything about farming!
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  I can help with crops, diseases, fertilizers, irrigation, and more.
                </p>
                <div className="mt-6 grid w-full max-w-md gap-2 sm:grid-cols-2">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      className="rounded-xl border border-slate-200 p-3 text-left text-xs text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        msg.role === "user"
                          ? "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                          : "bg-gradient-to-br from-emerald-500 to-green-600 text-white"
                      }`}
                    >
                      {msg.role === "user" ? "You" : <Bot className="h-4 w-4" />}
                    </div>
                    <div className={`max-w-[80%] ${msg.role === "user" ? "text-right" : ""}`}>
                      <div
                        className={`inline-block rounded-2xl px-4 py-2.5 text-sm ${
                          msg.role === "user"
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100"
                        }`}
                      >
                        <div className="whitespace-pre-wrap text-left">{msg.content}</div>
                      </div>
                      {msg.role === "assistant" && (
                        <div className="mt-1.5 flex gap-2">
                          <button
                            onClick={() => copyMessage(msg.content)}
                            className="text-xs text-slate-400 hover:text-emerald-600"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => shareMessage(msg.content)}
                            className="text-xs text-slate-400 hover:text-emerald-600"
                          >
                            <Share2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 text-white">
                      <Bot className="h-4 w-4 animate-pulse" />
                    </div>
                    <div className="rounded-2xl bg-slate-100 px-4 py-3 dark:bg-slate-800">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-slate-100 p-3 dark:border-slate-800">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ask about crops, diseases, fertilizers, irrigation..."
                rows={1}
                className="min-h-[44px] resize-none"
              />
              <Button onClick={sendMessage} loading={loading} className="self-end">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
