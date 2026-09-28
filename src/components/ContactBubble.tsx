"use client";

import { useState } from "react";

const contactLinks = [
  {
    label: "WhatsApp",
    helper: "Chat on WhatsApp",
    href: "https://wa.me/447774292572?text=Hi%20The%20Nail%20Lounge%2C%20I%27d%20like%20to%20book%20an%20appointment.",
    className: "bg-[#25D366] hover:bg-[#1fb857]",
    icon: WhatsAppIcon,
  },
  {
    label: "Facebook Messenger",
    helper: "Message our Facebook page",
    href: process.env.NEXT_PUBLIC_FACEBOOK_MESSENGER_URL || "https://m.me/nails.stokesley",
    className: "bg-[#0084FF] hover:bg-[#006fe0]",
    icon: MessengerIcon,
  },
  {
    label: "Instagram",
    helper: "Send us a DM",
    href: process.env.NEXT_PUBLIC_INSTAGRAM_MESSENGER_URL || "https://ig.me/m/nails.stokesley",
    className: "bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#FCAF45] hover:brightness-110",
    icon: InstagramIcon,
  },
];

const APP_EDITION = String(process.env.NEXT_PUBLIC_APP_EDITION || "pro").toLowerCase();

function publicFlag(value: string | undefined, fallback: boolean) {
  const normalized = String(value || "").trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
}

const SOCIAL_BUBBLES_ENABLED = publicFlag(process.env.NEXT_PUBLIC_ENABLE_SOCIAL_BUBBLES, APP_EDITION !== "basic");

export default function ContactBubble() {
  const [socialOpen, setSocialOpen] = useState(false);

  if (!SOCIAL_BUBBLES_ENABLED) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 font-sans">
      {socialOpen && (
        <div className="flex flex-col gap-2 mb-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
          {contactLinks.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-full text-white text-sm font-semibold shadow-lg transition-transform hover:scale-105 ${item.className}`}
              >
                <Icon />
                <span>{item.label}</span>
              </a>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={() => setSocialOpen((val) => !val)}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-sky-500 text-white shadow-2xl shadow-sky-300/50 transition-all hover:scale-105 focus:outline-none focus:ring-4 focus:ring-sky-200"
        aria-label={socialOpen ? "Close social contact links" : "Open social contact links"}
        aria-expanded={socialOpen}
      >
        <span className="relative flex h-14 w-14 items-center justify-center rounded-full">
          {socialOpen ? <CloseIcon /> : <MessengerIcon />}
        </span>
        {!socialOpen && (
          <span className="absolute right-[4rem] hidden whitespace-nowrap rounded-full bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white shadow-lg sm:block">
            Social links
          </span>
        )}
      </button>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.43 2.13 11.88c0 1.74.46 3.44 1.33 4.94L2 22l5.3-1.39a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.43 9.9-9.88A9.84 9.84 0 0 0 12.04 2Zm5.76 14.1c-.24.68-1.39 1.29-1.94 1.37-.5.07-1.12.1-1.8-.11-.42-.13-.96-.31-1.65-.6-2.9-1.25-4.8-4.16-4.94-4.35-.14-.2-1.18-1.57-1.18-3 0-1.42.75-2.12 1.01-2.41.27-.3.59-.37.78-.37h.57c.18.01.43-.07.67.51.24.58.84 2 .91 2.14.08.15.13.32.03.51-.1.2-.15.32-.3.49-.14.17-.3.38-.43.51-.15.15-.3.31-.13.6.17.3.76 1.25 1.63 2.03 1.12 1 2.06 1.31 2.35 1.46.3.15.47.13.64-.08.17-.2.74-.86.94-1.16.2-.29.39-.24.67-.14.27.1 1.72.81 2.01.96.3.15.5.22.57.34.07.12.07.71-.17 1.39Z" />
    </svg>
  );
}

function MessengerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.15 2 11.27c0 2.92 1.46 5.52 3.74 7.22V22l3.42-1.88c.9.25 1.86.39 2.84.39 5.52 0 10-4.15 10-9.24S17.52 2 12 2Zm1 12.48-2.55-2.72-4.98 2.72 5.47-5.8 2.61 2.72 4.91-2.72L13 14.48Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  );
}
