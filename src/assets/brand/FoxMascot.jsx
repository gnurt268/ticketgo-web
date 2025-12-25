const FoxMascot = ({ size = 80, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Tai trái */}
      <path
        d="M20 35L30 10L40 35"
        fill="#F59E0B"
        stroke="#E88A05"
        strokeWidth="2"
      />
      {/* Lông trong tai trái */}
      <path
        d="M25 30L30 18L35 30"
        fill="#FEF3C7"
      />
      
      {/* Tai phải */}
      <path
        d="M60 35L70 10L80 35"
        fill="#F59E0B"
        stroke="#E88A05"
        strokeWidth="2"
      />
      {/* Lông trong tai phải */}
      <path
        d="M65 30L70 18L75 30"
        fill="#FEF3C7"
      />
      
      {/* Mặt chính */}
      <ellipse
        cx="50"
        cy="55"
        rx="35"
        ry="32"
        fill="#F59E0B"
      />
      
      {/* Mặt trắng (phần dưới) */}
      <ellipse
        cx="50"
        cy="62"
        rx="25"
        ry="22"
        fill="#FEF3C7"
      />
      
      {/* Mắt trái */}
      <ellipse
        cx="38"
        cy="50"
        rx="6"
        ry="7"
        fill="#1E1B4B"
      />
      {/* Ánh sáng mắt trái */}
      <circle cx="36" cy="48" r="2" fill="white" />
      
      {/* Mắt phải */}
      <ellipse
        cx="62"
        cy="50"
        rx="6"
        ry="7"
        fill="#1E1B4B"
      />
      {/* Ánh sáng mắt phải */}
      <circle cx="60" cy="48" r="2" fill="white" />
      
      {/* Mũi */}
      <ellipse
        cx="50"
        cy="62"
        rx="5"
        ry="4"
        fill="#1E1B4B"
      />
      
      {/* Miệng cười */}
      <path
        d="M44 70 Q50 76 56 70"
        stroke="#1E1B4B"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Má trái (blush) */}
      <ellipse
        cx="28"
        cy="58"
        rx="5"
        ry="3"
        fill="#FBBF24"
        opacity="0.6"
      />
      
      {/* Má phải (blush) */}
      <ellipse
        cx="72"
        cy="58"
        rx="5"
        ry="3"
        fill="#FBBF24"
        opacity="0.6"
      />
      
      {/* Vé ticket nhỏ bên cạnh */}
      <g transform="translate(72, 20) rotate(15)">
        <rect
          x="0"
          y="0"
          width="20"
          height="12"
          rx="2"
          fill="#7C3AED"
        />
        <circle cx="0" cy="6" r="2" fill="#5E35B1" />
        <circle cx="20" cy="6" r="2" fill="#5E35B1" />
        <line
          x1="6"
          y1="3"
          x2="14"
          y2="3"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="6"
          y1="6"
          x2="12"
          y2="6"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="6"
          y1="9"
          x2="10"
          y2="9"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
};

export default FoxMascot;