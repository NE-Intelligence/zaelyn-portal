/** Los íconos de trazo del sitio, en un solo lugar (#186). */
export const trazo = {
  width: 26,
  height: 26,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export const Iconos = {
  plan: (
    <svg {...trazo}>
      <path d="M3 5.5h7.5M3 12h13M3 18.5h9" />
      <circle cx="19" cy="5.5" r="2" />
      <circle cx="19" cy="18.5" r="2" />
      <path d="M19 7.5v9" strokeDasharray="2 2.4" />
    </svg>
  ),
  familia: (
    <svg {...trazo}>
      <circle cx="7" cy="7" r="2.4" />
      <circle cx="17" cy="7" r="2.4" />
      <circle cx="12" cy="17" r="2.4" />
      <path d="M8.8 8.9l2.2 5.9M15.2 8.9L13 14.8M9.4 7h5.2" />
    </svg>
  ),
  reloj: (
    <svg {...trazo}>
      <path d="M12 4.2v7.8l4.6 2.7" />
      <circle cx="12" cy="12" r="8.4" />
    </svg>
  ),
  chat: (
    <svg {...trazo}>
      <path d="M4 5.5h16v10H9l-5 4z" />
      <path d="M8 9.5h8M8 12.5h5" />
    </svg>
  ),
  pantalla: (
    <svg {...trazo}>
      <rect x="3" y="4" width="18" height="12.5" rx="2" />
      <path d="M8 20h8M12 16.5V20M7 12l3-3 2.5 2L17 7.5" />
    </svg>
  ),
  escudo: (
    <svg {...trazo}>
      <path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.2-7.5 9.5-4.3-1.3-7.5-4.9-7.5-9.5V6z" />
      <path d="M9 12l2.2 2.2L15.5 10" />
    </svg>
  ),
  edificio: (
    <svg {...trazo}>
      <path d="M4 20.5V5.5l8-2.5v17.5M12 8.5l8 2.5v9.5M2.5 20.5h19M7 8h2M7 11.5h2M7 15h2M15 13h2M15 16.5h2" />
    </svg>
  ),
}
