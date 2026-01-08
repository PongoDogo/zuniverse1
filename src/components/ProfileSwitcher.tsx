import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Plus, Edit2, Trash2, Check, X } from "lucide-react";
import {
  getProfiles,
  createProfile,
  updateProfile,
  deleteProfile,
  getActiveProfile,
  setActiveProfile,
  getDefaultAvatars,
  UserProfile,
  Theme,
} from "@/lib/userPreferences";
import { useTheme } from "@/hooks/useTheme";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ProfileSwitcher = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeProfile, setActiveProfileState] = useState<UserProfile | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const { setTheme } = useTheme();

  const avatars = getDefaultAvatars();

  const refreshProfiles = () => {
    setProfiles(getProfiles());
    setActiveProfileState(getActiveProfile());
  };

  useEffect(() => {
    refreshProfiles();
  }, []);

  const handleCreateProfile = () => {
    if (newName.trim()) {
      const profile = createProfile(newName.trim(), selectedAvatar || undefined);
      setActiveProfile(profile.id);
      setTheme(profile.theme);
      setIsCreating(false);
      setNewName("");
      setSelectedAvatar("");
      refreshProfiles();
    }
  };

  const handleSwitchProfile = (profile: UserProfile) => {
    setActiveProfile(profile.id);
    setActiveProfileState(profile);
    setTheme(profile.theme);
  };

  const handleDeleteProfile = (id: string) => {
    deleteProfile(id);
    if (activeProfile?.id === id) {
      const remaining = getProfiles();
      if (remaining.length > 0) {
        setActiveProfile(remaining[0].id);
        setTheme(remaining[0].theme);
      }
    }
    refreshProfiles();
  };

  const handleUpdateTheme = (profileId: string, theme: Theme) => {
    updateProfile(profileId, { theme });
    setTheme(theme);
    refreshProfiles();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 p-2 rounded-lg bg-secondary/80 hover:bg-secondary transition-colors"
        >
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary/20 flex items-center justify-center text-sm">
            {activeProfile?.avatar || <User className="w-4 h-4" />}
          </div>
          <span className="text-sm font-medium hidden sm:block max-w-[80px] truncate">
            {activeProfile?.name || "Guest"}
          </span>
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {/* Existing Profiles */}
        {profiles.map((profile) => (
          <DropdownMenuItem
            key={profile.id}
            className={`flex items-center gap-2 cursor-pointer ${
              activeProfile?.id === profile.id ? "bg-primary/20" : ""
            }`}
            onClick={() => handleSwitchProfile(profile)}
          >
            <span className="text-lg">{profile.avatar}</span>
            <span className="flex-1 truncate">{profile.name}</span>
            {activeProfile?.id === profile.id && (
              <Check className="w-4 h-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}

        {profiles.length > 0 && <DropdownMenuSeparator />}

        {/* Create New Profile */}
        {isCreating ? (
          <div className="p-2 space-y-2">
            <Input
              placeholder="Profile name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="h-8 text-sm"
              autoFocus
            />
            <div className="flex flex-wrap gap-1">
              {avatars.slice(0, 10).map((avatar) => (
                <button
                  key={avatar}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-sm hover:bg-secondary transition-colors ${
                    selectedAvatar === avatar ? "bg-primary/30 ring-2 ring-primary" : ""
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              <button
                onClick={handleCreateProfile}
                disabled={!newName.trim()}
                className="flex-1 py-1.5 px-3 text-sm bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewName("");
                  setSelectedAvatar("");
                }}
                className="py-1.5 px-3 text-sm bg-secondary rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              setIsCreating(true);
            }}
            className="flex items-center gap-2 cursor-pointer text-primary"
          >
            <Plus className="w-4 h-4" />
            <span>Add Profile</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileSwitcher;
