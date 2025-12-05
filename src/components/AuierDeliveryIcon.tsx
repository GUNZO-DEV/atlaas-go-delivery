interface AuierDeliveryIconProps {
  className?: string;
}

const AuierDeliveryIcon = ({ className = "w-64 h-auto" }: AuierDeliveryIconProps) => {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <style>
        {`
          @keyframes scooterBounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
          }
          @keyframes wheelSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes speedLines {
            0% { opacity: 1; transform: translateX(0); }
            50% { opacity: 0.3; transform: translateX(-5px); }
            100% { opacity: 1; transform: translateX(0); }
          }
          @keyframes packageBounce {
            0%, 100% { transform: translateY(0) rotate(-5deg); }
            50% { transform: translateY(-2px) rotate(-3deg); }
          }
          .scooter-body {
            animation: scooterBounce 0.6s ease-in-out infinite;
          }
          .wheel {
            transform-origin: center;
            animation: wheelSpin 0.8s linear infinite;
          }
          .speed-line {
            animation: speedLines 0.5s ease-in-out infinite;
          }
          .speed-line-2 {
            animation: speedLines 0.5s ease-in-out infinite 0.1s;
          }
          .speed-line-3 {
            animation: speedLines 0.5s ease-in-out infinite 0.2s;
          }
          .package {
            animation: packageBounce 0.6s ease-in-out infinite;
            transform-origin: center bottom;
          }
        `}
      </style>
      
      {/* Speed lines */}
      <g className="speed-line">
        <line x1="25" y1="65" x2="45" y2="65" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
      </g>
      <g className="speed-line-2">
        <line x1="20" y1="75" x2="40" y2="75" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
      </g>
      <g className="speed-line-3">
        <line x1="25" y1="85" x2="45" y2="85" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
      </g>
      
      {/* Package/Box */}
      <g className="package">
        <rect x="55" y="45" width="30" height="25" rx="3" fill="#F59E0B" />
        <line x1="55" y1="55" x2="85" y2="55" stroke="#FCD34D" strokeWidth="2" />
        <line x1="70" y1="45" x2="70" y2="70" stroke="#FCD34D" strokeWidth="2" />
      </g>
      
      {/* Scooter body */}
      <g className="scooter-body">
        {/* Main body */}
        <path
          d="M60 90 Q70 75 100 75 L130 75 Q145 75 150 90 L150 100 L60 100 Z"
          fill="#F59E0B"
        />
        
        {/* Seat */}
        <ellipse cx="90" cy="73" rx="18" ry="6" fill="#F59E0B" />
        
        {/* Handlebar stem */}
        <path
          d="M135 75 L145 55 L155 55"
          stroke="#F59E0B"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Handlebar */}
        <line x1="148" y1="48" x2="148" y2="62" stroke="#F59E0B" strokeWidth="5" strokeLinecap="round" />
        <circle cx="148" cy="45" r="5" fill="#F59E0B" />
        
        {/* Front mudguard */}
        <path
          d="M140 100 Q150 90 160 100"
          stroke="#F59E0B"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Rear mudguard */}
        <path
          d="M55 100 Q65 90 75 100"
          stroke="#F59E0B"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Footrest */}
        <rect x="90" y="100" width="30" height="5" rx="2" fill="#F59E0B" />
      </g>
      
      {/* Rear wheel */}
      <g style={{ transformOrigin: '65px 115px' }} className="wheel">
        <circle cx="65" cy="115" r="18" fill="#F59E0B" />
        <circle cx="65" cy="115" r="10" fill="#FEF3C7" />
        <circle cx="65" cy="115" r="4" fill="#F59E0B" />
      </g>
      
      {/* Front wheel */}
      <g style={{ transformOrigin: '150px 115px' }} className="wheel">
        <circle cx="150" cy="115" r="18" fill="#F59E0B" />
        <circle cx="150" cy="115" r="10" fill="#FEF3C7" />
        <circle cx="150" cy="115" r="4" fill="#F59E0B" />
      </g>
      
      {/* Text */}
      <text
        x="100"
        y="160"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="20"
        fontWeight="800"
        fill="#F59E0B"
      >
        AUIER
      </text>
      <text
        x="100"
        y="178"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="11"
        fontWeight="600"
        fill="#FBBF24"
        letterSpacing="2"
      >
        CAMPUS DELIVERY
      </text>
    </svg>
  );
};

export default AuierDeliveryIcon;
