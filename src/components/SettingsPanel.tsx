import { useAppSettings, ImageQuality, UIDensity } from "@/hooks/useAppSettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import ThemeSwitcher from "./ThemeSwitcher";
import LanguageSwitcher from "./LanguageSwitcher";
import UILayoutSwitcher from "./UILayoutSwitcher";
import {
  Play,
  Image as ImageIcon,
  Sparkles,
  Eye,
  EyeOff,
  Zap,
  Gauge,
  Smartphone,
  RotateCcw,
  Palette,
  Database,
  Bell,
  Download,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

interface SettingRowProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}

const SettingRow = ({ icon, title, description, children }: SettingRowProps) => (
  <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
    <div className="flex items-start gap-3 min-w-0 flex-1">
      {icon && (
        <div className="w-8 h-8 rounded-lg bg-muted/40 flex items-center justify-center text-muted-foreground shrink-0">
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-sm font-medium leading-tight">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

const SectionCard = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <Card className="bg-card/40 backdrop-blur-sm border-border/40">
    <CardHeader className="pb-3">
      <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2 font-semibold">
        {icon}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="divide-y divide-border/40 pt-0">{children}</CardContent>
  </Card>
);

const SettingsPanel = () => {
  const { settings, update, reset } = useAppSettings();

  const exportData = () => {
    try {
      const data: Record<string, string | null> = {};
      Object.keys(localStorage).forEach((k) => (data[k] = localStorage.getItem(k)));
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cinetorrio-backup-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Backup exported");
    } catch {
      toast.error("Export failed");
    }
  };

  const importData = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        Object.entries(data).forEach(([k, v]) => {
          if (typeof v === "string") localStorage.setItem(k, v);
        });
        toast.success("Backup restored — reloading…");
        setTimeout(() => location.reload(), 800);
      } catch {
        toast.error("Invalid backup file");
      }
    };
    input.click();
  };

  const clearCache = () => {
    const preserve = ["appSettings.v1", "supabase.auth.token", "preferredStreamingSource"];
    Object.keys(localStorage).forEach((k) => {
      if (!preserve.some((p) => k.includes(p))) localStorage.removeItem(k);
    });
    toast.success("Cache cleared");
  };

  return (
    <div className="space-y-4">
      {/* Appearance */}
      <SectionCard title="Appearance" icon={<Palette className="w-3.5 h-3.5" />}>
        <SettingRow
          icon={<Sparkles className="w-4 h-4" />}
          title="Theme"
          description="Color scheme of the app"
        >
          <ThemeSwitcher />
        </SettingRow>
        <SettingRow
          icon={<Palette className="w-4 h-4" />}
          title="UI Layout"
          description="Choose your preferred theme experience"
        >
          <UILayoutSwitcher />
        </SettingRow>
        <SettingRow
          icon={<Bell className="w-4 h-4" />}
          title="Language"
          description="Display language"
        >
          <LanguageSwitcher />
        </SettingRow>
        <SettingRow
          icon={<Gauge className="w-4 h-4" />}
          title="UI Density"
          description="Spacing and component sizes"
        >
          <Select
            value={settings.uiDensity}
            onValueChange={(v: UIDensity) => update("uiDensity", v)}
          >
            <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="compact">Compact</SelectItem>
              <SelectItem value="cozy">Cozy</SelectItem>
              <SelectItem value="spacious">Spacious</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
        <SettingRow
          icon={<Zap className="w-4 h-4" />}
          title="Reduce motion"
          description="Disable animations and transitions"
        >
          <Switch
            checked={settings.reduceMotion}
            onCheckedChange={(v) => update("reduceMotion", v)}
          />
        </SettingRow>
      </SectionCard>

      {/* Playback */}
      <SectionCard title="Playback" icon={<Play className="w-3.5 h-3.5" />}>
        <SettingRow
          icon={<Play className="w-4 h-4" />}
          title="Autoplay next episode"
          description="Automatically play the next episode when one ends"
        >
          <Switch
            checked={settings.autoplayEnabled}
            onCheckedChange={(v) => update("autoplayEnabled", v)}
          />
        </SettingRow>
        <div className="py-3">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium">Autoplay countdown</Label>
            <span className="text-xs text-muted-foreground tabular-nums">
              {settings.autoplayCountdown}s
            </span>
          </div>
          <Slider
            value={[settings.autoplayCountdown]}
            min={3}
            max={30}
            step={1}
            onValueChange={([v]) => update("autoplayCountdown", v)}
            disabled={!settings.autoplayEnabled}
          />
        </div>
        <SettingRow
          icon={<Zap className="w-4 h-4" />}
          title="Auto-fallback sources"
          description="Try the next streaming source if one fails"
        >
          <Switch
            checked={settings.autoFallbackSources}
            onCheckedChange={(v) => update("autoFallbackSources", v)}
          />
        </SettingRow>
        <div className="py-3">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium">Mark as watched at</Label>
            <span className="text-xs text-muted-foreground tabular-nums">
              {settings.markWatchedThreshold}%
            </span>
          </div>
          <Slider
            value={[settings.markWatchedThreshold]}
            min={50}
            max={100}
            step={5}
            onValueChange={([v]) => update("markWatchedThreshold", v)}
          />
        </div>
      </SectionCard>

      {/* Content */}
      <SectionCard title="Content" icon={<Eye className="w-3.5 h-3.5" />}>
        <SettingRow
          icon={<EyeOff className="w-4 h-4" />}
          title="Hide spoilers"
          description="Blur episode descriptions and stills"
        >
          <Switch
            checked={settings.hideSpoilers}
            onCheckedChange={(v) => update("hideSpoilers", v)}
          />
        </SettingRow>
        <SettingRow
          icon={<Eye className="w-4 h-4" />}
          title="Show adult content"
          description="Include 18+ titles in browse and search"
        >
          <Switch
            checked={settings.showAdultContent}
            onCheckedChange={(v) => update("showAdultContent", v)}
          />
        </SettingRow>
        <SettingRow
          icon={<Sparkles className="w-4 h-4" />}
          title="Trending badges"
          description="Show 🔥 badges on hot titles"
        >
          <Switch
            checked={settings.showTrendingBadges}
            onCheckedChange={(v) => update("showTrendingBadges", v)}
          />
        </SettingRow>
        <SettingRow
          icon={<Smartphone className="w-4 h-4" />}
          title="Default landing tab"
          description="Where to take you on app open"
        >
          <Select
            value={settings.defaultLandingTab}
            onValueChange={(v: typeof settings.defaultLandingTab) => update("defaultLandingTab", v)}
          >
            <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="home">Home</SelectItem>
              <SelectItem value="movies">Movies</SelectItem>
              <SelectItem value="tv">TV Shows</SelectItem>
              <SelectItem value="discover">Discover</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
      </SectionCard>

      {/* Performance */}
      <SectionCard title="Performance" icon={<Zap className="w-3.5 h-3.5" />}>
        <SettingRow
          icon={<ImageIcon className="w-4 h-4" />}
          title="Image quality"
          description="Lower = faster loading, less data"
        >
          <Select
            value={settings.imageQuality}
            onValueChange={(v: ImageQuality) => update("imageQuality", v)}
          >
            <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
        <SettingRow
          icon={<Download className="w-4 h-4" />}
          title="Prefetch posters"
          description="Preload images for smoother scrolling"
        >
          <Switch
            checked={settings.prefetchPosters}
            onCheckedChange={(v) => update("prefetchPosters", v)}
          />
        </SettingRow>
        <SettingRow
          icon={<Smartphone className="w-4 h-4" />}
          title="Haptic feedback"
          description="Vibration on supported devices"
        >
          <Switch
            checked={settings.hapticFeedback}
            onCheckedChange={(v) => update("hapticFeedback", v)}
          />
        </SettingRow>
      </SectionCard>

      {/* Data */}
      <SectionCard title="Data & Storage" icon={<Database className="w-3.5 h-3.5" />}>
        <SettingRow
          icon={<Download className="w-4 h-4" />}
          title="Export backup"
          description="Save settings, favorites, and history to a file"
        >
          <Button onClick={exportData} size="sm" variant="secondary" className="h-8 text-xs">
            Export
          </Button>
        </SettingRow>
        <SettingRow
          icon={<Upload className="w-4 h-4" />}
          title="Restore backup"
          description="Import a previously exported file"
        >
          <Button onClick={importData} size="sm" variant="secondary" className="h-8 text-xs">
            Import
          </Button>
        </SettingRow>
        <SettingRow
          icon={<Database className="w-4 h-4" />}
          title="Clear cache"
          description="Remove cached browsing data (keeps account & settings)"
        >
          <Button onClick={clearCache} size="sm" variant="secondary" className="h-8 text-xs">
            Clear
          </Button>
        </SettingRow>
        <SettingRow
          icon={<RotateCcw className="w-4 h-4" />}
          title="Reset all settings"
          description="Restore default preferences"
        >
          <Button
            onClick={() => {
              reset();
              toast.success("Settings reset");
            }}
            size="sm"
            variant="destructive"
            className="h-8 text-xs"
          >
            Reset
          </Button>
        </SettingRow>
      </SectionCard>

      <Separator className="opacity-50" />
      <p className="text-[10px] text-center text-muted-foreground">
        CineTorrio · Settings sync to this device
      </p>
    </div>
  );
};

export default SettingsPanel;
