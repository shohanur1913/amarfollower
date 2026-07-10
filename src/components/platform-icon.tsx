"use client";

import {
  FaInstagram, FaFacebookF, FaTwitter, FaYoutube, FaTiktok,
  FaTelegram, FaSpotify, FaLinkedinIn, FaPinterestP,
  FaSnapchatGhost, FaRedditAlien, FaTwitch, FaDiscord,
  FaWhatsapp, FaGlobe, FaBookmark, FaChessKnight,
} from "react-icons/fa";
import { SiTiktok, SiThreads } from "react-icons/si";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  instagram: FaInstagram,
  facebook: FaFacebookF,
  facebookf: FaFacebookF,
  twitter: FaTwitter,
  x: FaTwitter,
  xtwitter: FaTwitter,
  youtube: FaYoutube,
  tiktok: SiTiktok,
  telegram: FaTelegram,
  spotify: FaSpotify,
  linkedin: FaLinkedinIn,
  linkedini: FaLinkedinIn,
  pinterest: FaPinterestP,
  snapchat: FaSnapchatGhost,
  reddit: FaRedditAlien,
  twitch: FaTwitch,
  discord: FaDiscord,
  whatsapp: FaWhatsapp,
  threads: SiThreads,
  globe: FaGlobe,
  bookmark: FaBookmark,
  chessknight: FaChessKnight,
  games: FaChessKnight,
};

const ICON_COLORS: Record<string, string> = {
  instagram: "#E4405F",
  facebook: "#1877F2",
  twitter: "#1DA1F2",
  x: "#000000",
  youtube: "#FF0000",
  tiktok: "#000000",
  telegram: "#26A5E4",
  spotify: "#1DB954",
  linkedin: "#0A66C2",
  pinterest: "#BD081C",
  snapchat: "#FFFC00",
  reddit: "#FF4500",
  twitch: "#9146FF",
  discord: "#5865F2",
  whatsapp: "#25D366",
  github: "#333333",
  threads: "#000000",
  globe: "#6B7280",
  bookmark: "#6B7280",
  chessknight: "#6B7280",
  games: "#6B7280",
};

function extractKey(iconClass: string | null | undefined, name: string | null | undefined): string {
  const raw = (iconClass || "").toLowerCase();
  if (raw.includes("instagram")) return "instagram";
  if (raw.includes("facebook")) return "facebook";
  if (raw.includes("x-twitter") || raw.includes("xtwitter")) return "x";
  if (raw.includes("twitter")) return "twitter";
  if (raw.includes("youtube")) return "youtube";
  if (raw.includes("tiktok")) return "tiktok";
  if (raw.includes("telegram")) return "telegram";
  if (raw.includes("spotify")) return "spotify";
  if (raw.includes("linkedin")) return "linkedin";
  if (raw.includes("pinterest")) return "pinterest";
  if (raw.includes("snapchat")) return "snapchat";
  if (raw.includes("reddit")) return "reddit";
  if (raw.includes("twitch")) return "twitch";
  if (raw.includes("discord")) return "discord";
  if (raw.includes("whatsapp")) return "whatsapp";
  if (raw.includes("globe")) return "globe";
  if (raw.includes("bookmark")) return "bookmark";
  if (raw.includes("chess") || raw.includes("knight")) return "chessknight";

  const nameKey = (name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (ICON_MAP[nameKey]) return nameKey;
  if (nameKey.includes("instagram")) return "instagram";
  if (nameKey.includes("facebook")) return "facebook";
  if (nameKey.includes("youtube")) return "youtube";
  if (nameKey.includes("tiktok")) return "tiktok";
  if (nameKey.includes("telegram")) return "telegram";
  if (nameKey.includes("spotify")) return "spotify";
  if (nameKey.includes("linkedin")) return "linkedin";
  if (nameKey.includes("games")) return "games";
  if (nameKey === "x") return "x";

  return nameKey;
}

export function PlatformIcon({
  iconClass,
  name,
  size = 20,
  className = "",
}: {
  iconClass?: string | null;
  name?: string;
  size?: number;
  className?: string;
}) {
  const key = extractKey(iconClass, name);
  const Icon = ICON_MAP[key];

  if (Icon) {
    return <div className={`t-icon-swap ${className}`} data-state="a"><Icon size={size} className="t-icon" data-icon="a" /></div>;
  }

  const color = ICON_COLORS[key];
  if (color) {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-full font-bold text-white shrink-0 ${className}`}
        style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.45 }}
      >
        {(name || iconClass || "?")[0].toUpperCase()}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-gray-200 text-gray-600 font-bold shrink-0 ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.45 }}
    >
      {(name || iconClass || "?")[0].toUpperCase()}
    </div>
  );
}
