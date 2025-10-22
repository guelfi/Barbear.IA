import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";
import { cn } from "../ui/utils";

export type IconAnimationType = 
  | "float" 
  | "pulse" 
  | "bounce" 
  | "wiggle" 
  | "spin" 
  | "shake" 
  | "scale" 
  | "sparkle"
  | "cut"
  | "glow"
  | "swing"
  | "flip"
  | "heartbeat"
  | "none";

export type IconCategory = 
  | "navigation" 
  | "action" 
  | "user" 
  | "admin" 
  | "stats" 
  | "calendar" 
  | "system"
  | "interactive";

interface AnimatedIconProps {
  icon: LucideIcon;
  animation?: IconAnimationType;
  category?: IconCategory;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  intensity?: "low" | "medium" | "high";
  hoverEffect?: boolean;
  clickEffect?: boolean;
  color?: string;
  delay?: number;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5", 
  lg: "h-6 w-6",
  xl: "h-8 w-8"
};

const animationVariants = {
  float: {
    y: [0, -4, 0],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  },
  pulse: {
    scale: [1, 1.1, 1],
    opacity: [0.8, 1, 0.8],
    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
  },
  bounce: {
    y: [0, -8, 0],
    transition: { duration: 0.6, repeat: Infinity, ease: "easeOut" }
  },
  wiggle: {
    rotate: [0, 3, -3, 0],
    transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
  },
  spin: {
    rotate: [0, 360],
    transition: { duration: 2, repeat: Infinity, ease: "linear" }
  },
  shake: {
    x: [0, -2, 2, -2, 0],
    transition: { duration: 0.5, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }
  },
  scale: {
    scale: [1, 1.2, 1],
    transition: { duration: 1, repeat: Infinity, ease: "easeInOut" }
  },
  sparkle: {
    scale: [1, 1.1, 1],
    filter: ["brightness(1)", "brightness(1.3)", "brightness(1)"],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  },
  cut: {
    rotate: [0, 15, -15, 0],
    scale: [1, 1.1, 1],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
  },
  glow: {
    filter: ["drop-shadow(0 0 0px currentColor)", "drop-shadow(0 0 8px currentColor)", "drop-shadow(0 0 0px currentColor)"],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  },
  swing: {
    rotate: [0, 10, -10, 5, -5, 0],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
  },
  flip: {
    rotateY: [0, 180, 360],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
  },
  heartbeat: {
    scale: [1, 1.3, 1, 1.1, 1],
    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
  },
  none: {}
};

const hoverVariants = {
  navigation: {
    scale: 1.1,
    rotate: [0, 5, -5, 0],
    transition: { duration: 0.3, type: "tween" as const }
  },
  action: {
    scale: 1.2,
    y: -2,
    transition: { duration: 0.2 }
  },
  user: {
    scale: 1.15,
    rotate: [0, 10, -10, 0],
    transition: { duration: 0.5, type: "tween" as const }
  },
  admin: {
    scale: 1.2,
    filter: "drop-shadow(0 0 8px currentColor)",
    transition: { duration: 0.3 }
  },
  stats: {
    scale: 1.1,
    y: -1,
    transition: { duration: 0.2 }
  },
  calendar: {
    scale: 1.15,
    rotateX: [0, 15, 0],
    transition: { duration: 0.4, type: "tween" as const }
  },
  system: {
    rotate: 360,
    transition: { duration: 0.6 }
  },
  interactive: {
    scale: 1.3,
    rotate: [0, 15, -15, 0],
    transition: { duration: 0.4, type: "tween" as const }
  }
};

const clickVariants = {
  scale: [1, 0.9, 1.1, 1],
  transition: { duration: 0.3, type: "tween" as const }
};

const categoryDefaults: Record<IconCategory, { animation: IconAnimationType; intensity: "low" | "medium" | "high" }> = {
  navigation: { animation: "float", intensity: "low" },
  action: { animation: "pulse", intensity: "medium" },
  user: { animation: "wiggle", intensity: "low" },
  admin: { animation: "glow", intensity: "high" },
  stats: { animation: "scale", intensity: "medium" },
  calendar: { animation: "bounce", intensity: "low" },
  system: { animation: "spin", intensity: "low" },
  interactive: { animation: "sparkle", intensity: "high" }
};

export function AnimatedIcon({
  icon: Icon,
  animation,
  category = "interactive",
  className,
  size = "md",
  intensity = "medium",
  hoverEffect = true,
  clickEffect = true,
  color,
  delay = 0
}: AnimatedIconProps) {
  // Use category defaults if no specific animation provided
  const defaultAnimation = categoryDefaults[category].animation;
  const finalAnimation = animation || defaultAnimation;
  const finalIntensity = intensity || categoryDefaults[category].intensity;

  // Adjust animation intensity
  const getAnimationWithIntensity = (baseAnimation: any) => {
    if (!baseAnimation.transition) return baseAnimation;
    
    const intensityMultiplier = {
      low: 0.6,
      medium: 1,
      high: 1.4
    }[finalIntensity];

    return {
      ...baseAnimation,
      transition: {
        ...baseAnimation.transition,
        duration: baseAnimation.transition.duration * intensityMultiplier
      }
    };
  };

  return (
    <motion.span
      className={cn(
        "inline-flex items-center justify-center transition-colors duration-200",
        className
      )}
      animate={finalAnimation !== "none" ? getAnimationWithIntensity(animationVariants[finalAnimation]) : {}}
      whileHover={hoverEffect ? hoverVariants[category] : {}}
      whileTap={clickEffect ? clickVariants : {}}
      style={{
        animationDelay: `${delay}ms`,
        color: color || "currentColor"
      }}
    >
      <Icon className={cn(sizeClasses[size], "transition-all duration-200")} />
    </motion.span>
  );
}

// Preset configurations for common use cases
export const presetConfigs = {
  navigationIcon: { category: "navigation" as IconCategory, animation: "float" as IconAnimationType, intensity: "low" as const },
  actionButton: { category: "action" as IconCategory, animation: "pulse" as IconAnimationType, intensity: "medium" as const },
  userAvatar: { category: "user" as IconCategory, animation: "wiggle" as IconAnimationType, intensity: "low" as const },
  adminTool: { category: "admin" as IconCategory, animation: "glow" as IconAnimationType, intensity: "high" as const },
  statsDisplay: { category: "stats" as IconCategory, animation: "scale" as IconAnimationType, intensity: "medium" as const },
  calendarEvent: { category: "calendar" as IconCategory, animation: "bounce" as IconAnimationType, intensity: "low" as const },
  systemStatus: { category: "system" as IconCategory, animation: "spin" as IconAnimationType, intensity: "low" as const },
  interactiveElement: { category: "interactive" as IconCategory, animation: "sparkle" as IconAnimationType, intensity: "high" as const }
};