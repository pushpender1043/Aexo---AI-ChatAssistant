import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageSquare, Plus, Search, Pin, Trash2, Share2, Link, PinOff } from "lucide-react";
import { toast } from "sonner";

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
  pinned?: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  conversations: Conversation[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete?: (id: string) => void;
  onPin?: (id: string) => void;
}

export default function ConversationSidebar({ open, onClose, conversations, currentId, onSelect, onNew, onDelete, onPin }: Props) {
  const [search, setSearch] = useState("");
  const [swipedId, setSwipedId] = useState<string | null>(null);

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const pinned = filtered.filter((c) => c.pinned);
  const unpinned = filtered.filter((c) => !c.pinned);

  const handleShare = (c: Conversation) => {
    const shareUrl = `${window.location.origin}/chat?shared=${c.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Chat link copied!");
  };

  const handleDelete = (id: string) => {
    onDelete?.(id);
    setSwipedId(null);
    toast.success("Conversation deleted");
  };

  const renderConversation = (c: Conversation) => (
    <div key={c.id} className="relative group">
      <button
        onClick={() => { onSelect(c.id); setSwipedId(null); }}
        className={`w-full text-left px-4 py-3 rounded-2xl text-sm transition-all flex items-center gap-2 ${
          currentId === c.id ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/50"
        }`}
      >
        <MessageSquare size={14} className="flex-shrink-0" />
        <span className="truncate flex-1">{c.title}</span>
        {c.pinned && <Pin size={12} className="text-primary flex-shrink-0" />}
      </button>
      {/* Action buttons on hover */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1">
        <button
          onClick={(e) => { e.stopPropagation(); onPin?.(c.id); }}
          className="p-1.5 rounded-full hover:bg-muted transition-colors"
          title={c.pinned ? "Unpin" : "Pin"}
        >
          {c.pinned ? <PinOff size={12} className="text-muted-foreground" /> : <Pin size={12} className="text-muted-foreground" />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleShare(c); }}
          className="p-1.5 rounded-full hover:bg-muted transition-colors"
          title="Share"
        >
          <Link size={12} className="text-muted-foreground" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
          className="p-1.5 rounded-full hover:bg-destructive/10 transition-colors"
          title="Delete"
        >
          <Trash2 size={12} className="text-destructive" />
        </button>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed left-0 top-0 bottom-0 w-72 sm:w-80 glass-strong z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <h3 className="font-semibold text-foreground">History</h3>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-muted transition-colors">
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>

            {/* Search */}
            <div className="px-3 pt-3">
              <div className="glass rounded-2xl flex items-center gap-2 px-3 py-2">
                <Search size={14} className="text-muted-foreground flex-shrink-0" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search conversations..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={onNew}
              className="mx-3 mt-3 flex items-center gap-2 px-4 py-3 rounded-2xl glass text-sm font-medium text-foreground hover:scale-[1.02] transition-transform"
            >
              <Plus size={16} className="text-primary" />
              New Chat
            </button>

            <div className="flex-1 overflow-y-auto px-3 pb-4 custom-scroll mt-2">
              {pinned.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 mb-1.5 font-semibold">Pinned</p>
                  <div className="space-y-0.5">{pinned.map(renderConversation)}</div>
                </div>
              )}
              {unpinned.length > 0 && (
                <div>
                  {pinned.length > 0 && <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 mb-1.5 mt-3 font-semibold">Recent</p>}
                  <div className="space-y-0.5">{unpinned.map(renderConversation)}</div>
                </div>
              )}
              {filtered.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8">
                  {search ? "No matches found" : "No conversations yet"}
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
