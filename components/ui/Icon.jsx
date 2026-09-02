const icons = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </>
  ),
  process: (
    <>
      <rect x="3" y="4" width="6" height="6" rx="1.5" />
      <rect x="15" y="14" width="6" height="6" rx="1.5" />
      <path d="M9 7h4a4 4 0 0 1 4 4v3M15 17h-4a4 4 0 0 1-4-4v-3" />
    </>
  ),
  monitor: (
    <>
      <path d="M3 12h4l2.2-5 3.4 10 2.2-5H21" />
      <path d="M4 4h16v16H4z" />
    </>
  ),
  kpi: (
    <>
      <path d="M4 19V9M10 19V5M16 19v-7M22 19V3" />
      <path d="M2 19h20" />
    </>
  ),
  spark: (
    <path d="m12 2 2.4 6.1L21 11l-6.6 2.9L12 20l-2.4-6.1L3 11l6.6-2.9L12 2Z" />
  ),
  forecast: (
    <>
      <path d="M3 18 9 12l4 3 8-9" />
      <path d="M15 6h6v6" />
    </>
  ),
  risk: (
    <>
      <path d="M12 3 2.8 19h18.4L12 3Z" />
      <path d="M12 9v4M12 16.5v.2" />
    </>
  ),
  recommendation: (
    <>
      <path d="M9 18h6M10 21h4" />
      <path d="M8.2 14.5A7 7 0 1 1 15.8 14.5c-.8.6-1.3 1.4-1.3 2.5h-5c0-1.1-.5-1.9-1.3-2.5Z" />
    </>
  ),
  money: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="M7 9h.01M17 15h.01" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  compare: (
    <>
      <path d="M7 4v16M17 4v16" />
      <path d="m4 8 3-3 3 3M14 16l3 3 3-3" />
    </>
  ),
  econometrics: (
    <>
      <path d="M3 19h18" />
      <circle cx="7" cy="14" r="1.5" />
      <circle cx="11" cy="10" r="1.5" />
      <circle cx="16" cy="7" r="1.5" />
      <path d="M5 16 18 5" />
    </>
  ),
  report: (
    <>
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M15 3v5h4M9 13h7M9 17h5" />
    </>
  ),
  building: (
    <>
      <path d="M4 21V7l8-4 8 4v14M2 21h20" />
      <path d="M8 9h2M14 9h2M8 13h2M14 13h2M10 21v-4h4v4" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="4" />
      <path d="M2.5 21a6.5 6.5 0 0 1 13 0M16 5.5a3.5 3.5 0 0 1 0 6.8M17 15a5 5 0 0 1 4.5 5" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  collapse: <path d="m14 6-6 6 6 6" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12M7 10l5 5 5-5" />
      <path d="M4 19h16" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V4M7 9l5-5 5 5" />
      <path d="M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 7v5h-5" />
      <path d="M18.2 16.2A8 8 0 1 1 20 12" />
    </>
  ),
  pause: (
    <>
      <path d="M9 5v14M15 5v14" />
    </>
  ),
  play: <path d="m8 5 11 7-11 7V5Z" />,
  arrowUp: <path d="m6 15 6-6 6 6M12 9v11" />,
  arrowDown: <path d="m6 9 6 6 6-6M12 4v11" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  dots: (
    <>
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </>
  ),
  logout: (
    <>
      <path d="M10 4H5v16h5M14 8l4 4-4 4M9 12h9" />
    </>
  ),
};

export default function Icon({ name, size = 20, className }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name] ?? icons.dashboard}
    </svg>
  );
}
