const Logo = ({ size = 'md', showText = true, className = '' }) => {
  // Size presets
  const sizes = {
    sm: { foxSize: 28, fontSize: '1.125rem' },
    md: { foxSize: 36, fontSize: '1.375rem' },
    lg: { foxSize: 48, fontSize: '1.75rem' },
    xl: { foxSize: 64, fontSize: '2.25rem' },
  };

  const { foxSize, fontSize } = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center gap-2 ${className}`} style={{ textDecoration: 'none' }}>
      {/* Fox Icon */}
      <svg
        width={foxSize}
        height={foxSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Tai trái */}
        <path
          d="M15 40L28 8L41 40"
          fill="#F59E0B"
        />
        <path
          d="M22 35L28 18L34 35"
          fill="#FEF3C7"
        />
        
        {/* Tai phải */}
        <path
          d="M59 40L72 8L85 40"
          fill="#F59E0B"
        />
        <path
          d="M66 35L72 18L78 35"
          fill="#FEF3C7"
        />
        
        {/* Mặt chính */}
        <ellipse
          cx="50"
          cy="58"
          rx="38"
          ry="35"
          fill="#F59E0B"
        />
        
        {/* Mặt trắng */}
        <ellipse
          cx="50"
          cy="65"
          rx="26"
          ry="24"
          fill="#FEF3C7"
        />
        
        {/* Mắt trái */}
        <ellipse cx="36" cy="52" rx="6" ry="7" fill="#1E1B4B" />
        <circle cx="34" cy="50" r="2.5" fill="white" />
        
        {/* Mắt phải */}
        <ellipse cx="64" cy="52" rx="6" ry="7" fill="#1E1B4B" />
        <circle cx="62" cy="50" r="2.5" fill="white" />
        
        {/* Mũi */}
        <ellipse cx="50" cy="64" rx="5" ry="4" fill="#1E1B4B" />
        
        {/* Miệng cười */}
        <path
          d="M42 72 Q50 80 58 72"
          stroke="#1E1B4B"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Má */}
        <ellipse cx="24" cy="60" rx="6" ry="4" fill="#FBBF24" opacity="0.5" />
        <ellipse cx="76" cy="60" rx="6" ry="4" fill="#FBBF24" opacity="0.5" />
      </svg>

      {/* Text Logo */}
      {showText && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <span
            style={{
              fontSize,
              fontWeight: 700,
              color: '#5E35B1',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            Ticket
          </span>
          <span
            style={{
              fontSize,
              fontWeight: 700,
              color: '#F59E0B',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            GO
          </span>
        </div>
      )}
    </div>
  );
};

// Fox icon only (for favicon, small spaces)
export const FoxIcon = ({ size = 32, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Tai trái */}
    <path d="M15 40L28 8L41 40" fill="#F59E0B" />
    <path d="M22 35L28 18L34 35" fill="#FEF3C7" />
    
    {/* Tai phải */}
    <path d="M59 40L72 8L85 40" fill="#F59E0B" />
    <path d="M66 35L72 18L78 35" fill="#FEF3C7" />
    
    {/* Mặt chính */}
    <ellipse cx="50" cy="58" rx="38" ry="35" fill="#F59E0B" />
    
    {/* Mặt trắng */}
    <ellipse cx="50" cy="65" rx="26" ry="24" fill="#FEF3C7" />
    
    {/* Mắt */}
    <ellipse cx="36" cy="52" rx="6" ry="7" fill="#1E1B4B" />
    <circle cx="34" cy="50" r="2.5" fill="white" />
    <ellipse cx="64" cy="52" rx="6" ry="7" fill="#1E1B4B" />
    <circle cx="62" cy="50" r="2.5" fill="white" />
    
    {/* Mũi */}
    <ellipse cx="50" cy="64" rx="5" ry="4" fill="#1E1B4B" />
    
    {/* Miệng */}
    <path d="M42 72 Q50 80 58 72" stroke="#1E1B4B" strokeWidth="3" strokeLinecap="round" fill="none" />
    
    {/* Má */}
    <ellipse cx="24" cy="60" rx="6" ry="4" fill="#FBBF24" opacity="0.5" />
    <ellipse cx="76" cy="60" rx="6" ry="4" fill="#FBBF24" opacity="0.5" />
  </svg>
);

export default Logo;