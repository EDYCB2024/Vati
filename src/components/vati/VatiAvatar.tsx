import React from "react";

export default function VatiAvatar({
  size = "lg",
}: {
  size?: "sm" | "md" | "lg";
}) {
  const dim =
    size === "sm"
      ? "w-8 h-8"
      : size === "md"
      ? "w-10 h-10"
      : "w-24 h-24";

  return (
    <div
      className={`${dim} rounded-full overflow-hidden bg-gradient-to-br from-[#e2e8ff] via-[#eef2ff] to-[#dbeafe] flex items-center justify-center shrink-0 select-none`}
    >
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        aria-label="Avatar de Vati"
      >
        <defs>
          <linearGradient id="vatiBg" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E6ECFF" />
            <stop offset="1" stopColor="#CFE0FF" />
          </linearGradient>
          <linearGradient id="vatiShirt" x1="25" y1="84" x2="95" y2="120" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3A388B" />
            <stop offset="1" stopColor="#0058BE" />
          </linearGradient>
          <linearGradient id="vatiHeadset" x1="20" y1="30" x2="100" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor="#262468" />
            <stop offset="1" stopColor="#3A388B" />
          </linearGradient>
        </defs>

        <circle cx="60" cy="60" r="60" fill="url(#vatiBg)" />

        {/* Shoulders / Uniform */}
        <path
          d="M22 120C24 95 40 85 60 85C80 85 96 95 98 120H22Z"
          fill="url(#vatiShirt)"
        />
        <path d="M51 85L60 98L69 85H51Z" fill="#FFFFFF" opacity="0.92" />

        {/* Neck */}
        <rect x="52" y="72" width="16" height="16" rx="7" fill="#F2C6A0" />

        {/* Hair back */}
        <path
          d="M32 54C32 33 44 21 60 21C76 21 88 33 88 54V72C88 78 83 82 78 82H42C37 82 32 78 32 72V54Z"
          fill="#2D2338"
        />

        {/* Face */}
        <ellipse cx="60" cy="54" rx="21" ry="23" fill="#FAD4B4" />

        {/* Hair bangs */}
        <path
          d="M38 49C40 34 50 26 62 27C74 28 81 36 82 49C76 41 69 37 59 38C49 39 43 43 38 49Z"
          fill="#2D2338"
        />

        {/* Eyes */}
        <circle cx="52" cy="54" r="2.6" fill="#1E1B4B" />
        <circle cx="68" cy="54" r="2.6" fill="#1E1B4B" />
        <circle cx="52.8" cy="53.2" r="0.8" fill="#FFFFFF" />
        <circle cx="68.8" cy="53.2" r="0.8" fill="#FFFFFF" />

        {/* Eyebrows */}
        <path d="M47.5 48.5C49.5 47 53 47 55 48.2" stroke="#2D2338" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M65 48.2C67 47 70.5 47 72.5 48.5" stroke="#2D2338" strokeWidth="1.8" strokeLinecap="round" />

        {/* Cheeks */}
        <ellipse cx="46.5" cy="59.5" rx="3.5" ry="2" fill="#F4978E" opacity="0.45" />
        <ellipse cx="73.5" cy="59.5" rx="3.5" ry="2" fill="#F4978E" opacity="0.45" />

        {/* Warm smile */}
        <path
          d="M53.5 63.5C55.8 66.5 64.2 66.5 66.5 63.5"
          stroke="#9E4B4B"
          strokeWidth="2.3"
          strokeLinecap="round"
        />

        {/* Headset */}
        <path
          d="M36 53C36 37 46 25 60 25C74 25 84 37 84 53"
          stroke="url(#vatiHeadset)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <rect x="32" y="48" width="7" height="14" rx="3.5" fill="#0058BE" />
        <rect x="81" y="48" width="7" height="14" rx="3.5" fill="#0058BE" />
        <path
          d="M84 59C84 67 76 70 67 69"
          stroke="#0058BE"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <circle cx="66" cy="69" r="2.2" fill="#3A388B" />
      </svg>
    </div>
  );
}
