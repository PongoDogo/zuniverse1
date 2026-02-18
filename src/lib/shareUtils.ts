import { toast } from "sonner";

export const shareMedia = async (
  title: string,
  mediaType: "movie" | "tv",
  mediaId: number,
  language: "en" | "el" = "en"
) => {
  const url = `${window.location.origin}/${mediaType}/${mediaId}`;
  const text = language === "el"
    ? `Δες "${title}" στο CineTorrio!`
    : `Check out "${title}" on CineTorrio!`;

  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
    } catch {
      // User cancelled
    }
  } else {
    await copyLink(url, language);
  }
};

export const copyLink = async (url: string, language: "en" | "el" = "en") => {
  try {
    await navigator.clipboard.writeText(url);
    toast.success(language === "el" ? "Ο σύνδεσμος αντιγράφηκε!" : "Link copied to clipboard!");
  } catch {
    // Fallback
    const input = document.createElement("input");
    input.value = url;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
    toast.success(language === "el" ? "Ο σύνδεσμος αντιγράφηκε!" : "Link copied to clipboard!");
  }
};

export const shareCollection = async (language: "en" | "el" = "en") => {
  const url = `${window.location.origin}/collection`;
  const text = language === "el"
    ? "Δες τη συλλογή μου στο CineTorrio!"
    : "Check out my collection on CineTorrio!";

  if (navigator.share) {
    try {
      await navigator.share({ title: "CineTorrio Collection", text, url });
    } catch {}
  } else {
    await copyLink(url, language);
  }
};
