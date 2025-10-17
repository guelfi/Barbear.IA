import { Menu, Bell } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ThemeToggle } from '../ui/theme-toggle';
import { AnimatedIcon } from '../ui/animated-icon';

interface HeaderProps {
  title: string;
  onMenuToggle: () => void;
}

export function Header({ title, onMenuToggle }: HeaderProps) {

  return (
    <header className="bg-card border-b border-border px-4 py-3 lg:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden hover:scale-105 transition-transform duration-200"
            onClick={onMenuToggle}
          >
            <AnimatedIcon
              icon={Menu}
              animation="wiggle"
              category="navigation"
              size="md"
              intensity="medium"
            />
          </Button>
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>

        <div className="flex items-center space-x-2">
          <ThemeToggle />
          
          <Button variant="ghost" size="sm" className="relative hover:scale-105 transition-transform duration-200">
            <AnimatedIcon
              icon={Bell}
              animation="bounce"
              category="action"
              size="sm"
              intensity="medium"
            />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs animate-pulse">
              3
            </Badge>
          </Button>
        </div>
      </div>
    </header>
  );
}