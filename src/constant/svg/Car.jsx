const CarIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M3 13 L5 8 H15 L18 11 H21 A1 1 0 0 1 22 12 V15 A1 1 0 0 1 21 16 H20 A2 2 0 0 1 16 16 H8 A2 2 0 0 1 4 16 H3 A1 1 0 0 1 2 15 V14 A1 1 0 0 1 3 13 Z" />
    <path d="M6 8 H13 L15.5 11 H6 Z" />
    <circle cx="7" cy="16" r="1.6" />
    <circle cx="17" cy="16" r="1.6" />
  </svg>
);
export default CarIcon;