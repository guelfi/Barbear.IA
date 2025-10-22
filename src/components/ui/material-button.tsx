import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const materialButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-material focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ripple relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 elevation-1 hover:elevation-2",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 elevation-1 hover:elevation-2",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:elevation-1",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 elevation-1 hover:elevation-2",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        fab: "rounded-full bg-primary text-primary-foreground hover:bg-primary/90 elevation-3 hover:elevation-4 hover-lift",
        raised: "bg-primary text-primary-foreground hover:bg-primary/90 elevation-2 hover:elevation-3 hover-lift",
        flat: "bg-accent text-accent-foreground hover:bg-accent/80",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-md px-10 text-base",
        icon: "h-10 w-10",
        fab: "h-14 w-14",
        fabLarge: "h-16 w-16",
      },
      animation: {
        none: "",
        bounce: "btn-bounce",
        pulse: "btn-pulse",
        shake: "btn-shake",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "none",
    },
  }
);

export interface MaterialButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof materialButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
  rippleColor?: string;
}

const MaterialButton = React.forwardRef<HTMLButtonElement, MaterialButtonProps>(
  ({ className, variant, size, animation, asChild = false, loading = false, rippleColor, children, onClick, ...props }, ref) => {
    const [ripples, setRipples] = React.useState<Array<{ key: number; x: number; y: number }>>([]);
    const Comp = asChild ? Slot : "button";

    const addRipple = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const newRipple = {
        key: Date.now(),
        x,
        y,
      };

      setRipples(prev => [...prev, newRipple]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.key !== newRipple.key));
      }, 600);

      // Call original onClick if provided
      if (onClick) {
        onClick(event);
      }
    }, [onClick]);

    return (
      <Comp
        className={cn(materialButtonVariants({ variant, size, animation, className }))}
        ref={ref}
        onClick={addRipple}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && (
          <div className="mr-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
        )}
        {children}
        
        {/* Ripple effects */}
        {ripples.map((ripple) => (
          <span
            key={ripple.key}
            className="absolute rounded-full animate-ping opacity-30"
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
              width: 20,
              height: 20,
              backgroundColor: rippleColor || 'currentColor',
              pointerEvents: 'none',
            }}
          />
        ))}
      </Comp>
    );
  }
);

MaterialButton.displayName = "MaterialButton";

export { MaterialButton, materialButtonVariants };
