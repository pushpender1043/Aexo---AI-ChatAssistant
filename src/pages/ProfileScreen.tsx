import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, LogOut, User, Mail, Settings, Moon, Sun, Volume2, ChevronRight, Shield, Bell, X, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/integrations/supabase/client";
import GradientBackground from "@/components/GradientBackground";
import aexoMascot from "@/assets/aexo-mascot.png";
import { toast } from "sonner";

type ModalType = "editProfile" | "emailPrefs" | "notifications" | "privacy" | "general" | null;

export default function ProfileScreen() {
  const navigate = useNavigate();
  const { profile, user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [modal, setModal] = useState<ModalType>(null);
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [voiceEnabled, setVoiceEnabled] = useState(() => localStorage.getItem("aexo-voice") !== "false");
  const [saving, setSaving] = useState(false);

  const userName = profile?.display_name || user?.email?.split("@")[0] || "User";

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) { toast.error("Failed to update"); return; }
    toast.success("Profile updated!");
    setModal(null);
  };

  const toggleVoice = () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    localStorage.setItem("aexo-voice", String(next));
  };

  return (
    <GradientBackground>
      <div className="min-h-screen max-w-md mx-auto px-4 sm:px-6 py-6 lg:max-w-lg xl:max-w-xl">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate("/dashboard")} className="w-9 h-9 rounded-full glass btn-drop flex items-center justify-center">
            <ArrowLeft size={18} className="text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground font-display">Profile</h1>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full gradient-bg flex items-center justify-center text-3xl text-primary-foreground font-bold glow-primary overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                userName[0]?.toUpperCase()
              )}
            </div>
            <button
              onClick={() => setModal("editProfile")}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full gradient-bg flex items-center justify-center border-2 border-background"
            >
              <Camera size={14} className="text-primary-foreground" />
            </button>
          </div>
          <h2 className="text-xl font-bold text-foreground mt-4 font-display">{userName}</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-3">
          <div className="glass rounded-3xl p-4 space-y-1">
            <SettingRow icon={User} label="Edit Profile" onClick={() => { setDisplayName(profile?.display_name || ""); setModal("editProfile"); }} />
            <SettingRow icon={Mail} label="Email Preferences" onClick={() => setModal("emailPrefs")} />
            <SettingRow icon={Bell} label="Notifications" onClick={() => setModal("notifications")} />
            <SettingRow icon={Shield} label="Privacy & Security" onClick={() => setModal("privacy")} />
            <SettingRow icon={Settings} label="General Settings" onClick={() => setModal("general")} />
          </div>

          <div className="glass rounded-3xl p-4 space-y-1">
            <div className="flex items-center gap-3 px-2 py-3">
              {theme === "dark" ? <Moon size={20} className="text-primary" /> : <Sun size={20} className="text-primary" />}
              <span className="text-sm font-medium text-foreground flex-1">
                {theme === "dark" ? "Dark Mode" : "Light Mode"}
              </span>
              <button
                onClick={toggleTheme}
                className={`w-12 h-7 rounded-full relative cursor-pointer transition-colors duration-300 ${
                  theme === "dark" ? "gradient-bg" : "bg-muted"
                }`}
              >
                <motion.div
                  animate={{ x: theme === "dark" ? 22 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="w-5 h-5 rounded-full bg-primary-foreground absolute top-1 shadow-md"
                />
              </button>
            </div>
            <div className="flex items-center gap-3 px-2 py-3">
              <Volume2 size={20} className="text-primary" />
              <span className="text-sm font-medium text-foreground flex-1">Voice Response</span>
              <button
                onClick={toggleVoice}
                className={`w-12 h-7 rounded-full relative cursor-pointer transition-colors duration-300 ${
                  voiceEnabled ? "gradient-bg" : "bg-muted"
                }`}
              >
                <motion.div
                  animate={{ x: voiceEnabled ? 22 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="w-5 h-5 rounded-full bg-primary-foreground absolute top-1 shadow-md"
                />
              </button>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full glass rounded-3xl p-4 flex items-center gap-3 text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Log Out</span>
          </button>
        </motion.div>

        <div className="flex items-center justify-center gap-2 mt-8 opacity-40">
          <img src={aexoMascot} alt="Aexo" className="w-5 h-5 object-contain" />
          <span className="text-xs text-muted-foreground">Powered by Aexo AI</span>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {modal && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40" onClick={() => setModal(null)} />
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto lg:max-w-lg"
              >
                <div className="glass-strong rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto custom-scroll">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-foreground text-lg font-display">
                      {modal === "editProfile" && "Edit Profile"}
                      {modal === "emailPrefs" && "Email Preferences"}
                      {modal === "notifications" && "Notifications"}
                      {modal === "privacy" && "Privacy & Security"}
                      {modal === "general" && "General Settings"}
                    </h3>
                    <button onClick={() => setModal(null)} className="p-2 rounded-full hover:bg-muted">
                      <X size={18} className="text-muted-foreground" />
                    </button>
                  </div>

                  {modal === "editProfile" && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1 block">Display Name</label>
                        <input
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl glass text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
                        <input value={user?.email || ""} disabled className="w-full px-4 py-3 rounded-2xl glass text-sm text-muted-foreground" />
                      </div>
                      <button onClick={handleSaveProfile} disabled={saving} className="w-full py-3 rounded-2xl gradient-bg text-primary-foreground font-semibold text-sm">
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  )}

                  {modal === "emailPrefs" && (
                    <div className="space-y-3">
                      <ToggleItem label="Marketing emails" defaultOn={false} />
                      <ToggleItem label="Product updates" defaultOn={true} />
                      <ToggleItem label="Weekly digest" defaultOn={true} />
                    </div>
                  )}

                  {modal === "notifications" && (
                    <div className="space-y-3">
                      <ToggleItem label="Push notifications" defaultOn={true} />
                      <ToggleItem label="Sound alerts" defaultOn={true} />
                      <ToggleItem label="Chat replies" defaultOn={true} />
                    </div>
                  )}

                  {modal === "privacy" && (
                    <div className="space-y-4 text-sm text-muted-foreground">
                      <p>Your data is encrypted and stored securely. We never share your conversations with third parties.</p>
                      <div className="space-y-3">
                        <ToggleItem label="Analytics collection" defaultOn={true} />
                        <ToggleItem label="Personalized suggestions" defaultOn={true} />
                      </div>
                      <button className="w-full py-3 rounded-2xl glass text-destructive font-medium text-sm mt-4">Delete All Data</button>
                    </div>
                  )}

                  {modal === "general" && (
                    <div className="space-y-3">
                      <ToggleItem label="Auto-save conversations" defaultOn={true} />
                      <ToggleItem label="Show timestamps" defaultOn={true} />
                      <ToggleItem label="Compact messages" defaultOn={false} />
                      <div className="pt-4 text-xs text-muted-foreground text-center">
                        Aexo v1.0.0 • Made with ❤️
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </GradientBackground>
  );
}

function SettingRow({ icon: Icon, label, onClick }: { icon: any; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-2 py-3 rounded-2xl hover:bg-muted/50 transition-colors">
      <Icon size={20} className="text-primary" />
      <span className="text-sm font-medium text-foreground flex-1 text-left">{label}</span>
      <ChevronRight size={16} className="text-muted-foreground" />
    </button>
  );
}

function ToggleItem({ label, defaultOn }: { label: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-foreground">{label}</span>
      <button
        onClick={() => setOn(!on)}
        className={`w-12 h-7 rounded-full relative cursor-pointer transition-colors duration-300 ${on ? "gradient-bg" : "bg-muted"}`}
      >
        <motion.div
          animate={{ x: on ? 22 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="w-5 h-5 rounded-full bg-primary-foreground absolute top-1 shadow-md"
        />
      </button>
    </div>
  );
}
