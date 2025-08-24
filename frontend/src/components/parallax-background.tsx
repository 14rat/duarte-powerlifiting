interface ParallaxBackgroundProps {
  className?: string;
}

export function ParallaxBackground({ className = '' }: ParallaxBackgroundProps) {
  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden ${className}`}>
      {/* Main background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255, 193, 7, 0.15) 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }} />
      </div>
      
      {/* Overlay gradient to ensure readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
    </div>
  );
}