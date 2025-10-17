import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const materialCardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow transition-material",
  {
    variants: {
      elevation: {
        0: "shadow-none",
        1: "elevation-1",
        2: "elevation-2", 
        3: "elevation-3",
        4: "elevation-4",
        5: "elevation-5",
      },
      interactive: {
        true: "hover-lift cursor-pointer",
        false: "",
      },
      animation: {
        none: "",
        fadeIn: "fade-in",
        slideUp: "slide-in-up",
        slideDown: "slide-in-down",
        slideLeft: "slide-in-left",
        slideRight: "slide-in-right",
        scaleIn: "scale-in",
      },
    },
    defaultVariants: {
      elevation: 1,
      interactive: false,
      animation: "none",
    },
  }
);

export interface MaterialCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof materialCardVariants> {
  hoverElevation?: 0 | 1 | 2 | 3 | 4 | 5;
}

const MaterialCard = React.forwardRef<HTMLDivElement, MaterialCardProps>(
  ({ className, elevation, interactive, animation, hoverElevation, ...props }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false);
    
    const handleMouseEnter = () => {
      setIsHovered(true);
    };
    
    const handleMouseLeave = () => {
      setIsHovered(false);
    };

    const hoverElevationClass = hoverElevation && isHovered ? `elevation-${hoverElevation}` : '';

    return (
      <div
        ref={ref}
        className={cn(
          materialCardVariants({ elevation, interactive, animation }),
          hoverElevationClass,
          className
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      />
    );
  }
);

MaterialCard.displayName = "MaterialCard";

const MaterialCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
MaterialCardHeader.displayName = "MaterialCardHeader";

const MaterialCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
MaterialCardTitle.displayName = "MaterialCardTitle";

const MaterialCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
MaterialCardDescription.displayName = "MaterialCardDescription";

const MaterialCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
MaterialCardContent.displayName = "MaterialCardContent";

const MaterialCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
MaterialCardFooter.displayName = "MaterialCardFooter";

export {
  MaterialCard,
  MaterialCardHeader,
  MaterialCardFooter,
  MaterialCardTitle,
  MaterialCardDescription,
  MaterialCardContent,
  materialCardVariants,
};