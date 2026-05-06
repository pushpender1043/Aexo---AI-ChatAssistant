import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Conversation {
  id: string;
  title: string;
  mode: string;
  updated_at: string;
  pinned?: boolean;
}

interface DBMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  images: string[];
  created_at: string;
}

export function useChatHistory(mode: string) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConvoId, setCurrentConvoId] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("aexo-pinned");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("conversations")
      .select("*")
      .eq("mode", mode)
      .order("updated_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (data) {
          setConversations(
            (data as Conversation[]).map((c) => ({ ...c, pinned: pinnedIds.has(c.id) }))
          );
        }
      });
  }, [user, mode]);

  const createConversation = useCallback(async (firstMessage: string) => {
    if (!user) return null;
    const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? "..." : "");
    const { data, error } = await supabase
      .from("conversations")
      .insert({ user_id: user.id, title, mode })
      .select()
      .single();
    if (error || !data) return null;
    const convo = data as Conversation;
    setCurrentConvoId(convo.id);
    setConversations((prev) => [convo, ...prev]);
    return convo.id;
  }, [user, mode]);

  const saveMessage = useCallback(async (convoId: string, role: "user" | "assistant", content: string, images?: string[]) => {
    await supabase.from("messages").insert({
      conversation_id: convoId,
      role,
      content,
      images: images || [],
    });
  }, []);

  const loadMessages = useCallback(async (convoId: string): Promise<DBMessage[]> => {
    setLoadingHistory(true);
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", convoId)
      .order("created_at", { ascending: true });
    setLoadingHistory(false);
    setCurrentConvoId(convoId);
    return (data || []) as DBMessage[];
  }, []);

  const deleteConversation = useCallback(async (convoId: string) => {
    await supabase.from("messages").delete().eq("conversation_id", convoId);
    await supabase.from("conversations").delete().eq("id", convoId);
    setConversations((prev) => prev.filter((c) => c.id !== convoId));
    if (currentConvoId === convoId) setCurrentConvoId(null);
  }, [currentConvoId]);

  const togglePin = useCallback((convoId: string) => {
    setPinnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(convoId)) next.delete(convoId);
      else next.add(convoId);
      localStorage.setItem("aexo-pinned", JSON.stringify([...next]));
      return next;
    });
    setConversations((prev) =>
      prev.map((c) => c.id === convoId ? { ...c, pinned: !c.pinned } : c)
    );
  }, []);

  return { conversations, currentConvoId, createConversation, saveMessage, loadMessages, loadingHistory, setCurrentConvoId, deleteConversation, togglePin };
}
