import { Dumbbell } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Logo({ size = "md", className = "" }: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  return (
    <div className={`p-2 bg-yellow-400 rounded-lg ${className}`}>
      <Dumbbell className={`${sizeClasses[size]} text-black`} />
    </div>
  );
}