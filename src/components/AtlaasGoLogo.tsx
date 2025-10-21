interface AtlaasGoLogoProps {
  className?: string;
}

const AtlaasGoLogo = ({ className = "w-48 h-auto" }: AtlaasGoLogoProps) => {
  return (
    <svg
      viewBox="0 0 900 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Location Pin */}
      <circle cx="110" cy="35" r="18" fill="#D2691E" />
      <circle cx="110" cy="35" r="8" fill="#F5F5DC" />
      
      {/* Mountain with Road */}
      <path
        d="M30 150 L110 60 L190 150 Z"
        fill="#D2691E"
      />
      <path
        d="M110 75 Q100 90 95 105 Q92 115 95 125 Q100 135 110 140 Q120 135 125 125 Q128 115 125 105 Q120 90 110 75 Z"
        fill="#F5F5DC"
      />
      
      {/* ATLAAS Text */}
      <text
        x="240"
        y="120"
        fontFamily="Arial, sans-serif"
        fontSize="90"
        fontWeight="800"
        fill="#1e3a5f"
      >
        ATLAAS
      </text>
      
      {/* GO Text */}
      <text
        x="240"
        y="180"
        fontFamily="Arial, sans-serif"
        fontSize="90"
        fontWeight="800"
        fill="#D2691E"
      >
        GO
      </text>
    </svg>
  );
};

export default AtlaasGoLogo;
