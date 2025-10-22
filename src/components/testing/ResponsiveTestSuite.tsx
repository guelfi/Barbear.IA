import { useState, useEffect } from 'react';
import { Smartphone, Tablet, Monitor, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface DevicePreset {
  name: string;
  width: number;
  height: number;
  icon: React.ReactNode;
  category: 'mobile' | 'tablet' | 'desktop';
}

const devicePresets: DevicePreset[] = [
  // Mobile devices
  { name: 'iPhone SE', width: 375, height: 667, icon: <Smartphone className="h-4 w-4" />, category: 'mobile' },
  { name: 'iPhone 12', width: 390, height: 844, icon: <Smartphone className="h-4 w-4" />, category: 'mobile' },
  { name: 'iPhone 14 Pro Max', width: 430, height: 932, icon: <Smartphone className="h-4 w-4" />, category: 'mobile' },
  { name: 'Samsung Galaxy S21', width: 384, height: 854, icon: <Smartphone className="h-4 w-4" />, category: 'mobile' },
  { name: 'Google Pixel 6', width: 393, height: 851, icon: <Smartphone className="h-4 w-4" />, category: 'mobile' },
  
  // Tablets
  { name: 'iPad Mini', width: 768, height: 1024, icon: <Tablet className="h-4 w-4" />, category: 'tablet' },
  { name: 'iPad Air', width: 820, height: 1180, icon: <Tablet className="h-4 w-4" />, category: 'tablet' },
  { name: 'iPad Pro 11"', width: 834, height: 1194, icon: <Tablet className="h-4 w-4" />, category: 'tablet' },
  { name: 'Samsung Galaxy Tab', width: 800, height: 1280, icon: <Tablet className="h-4 w-4" />, category: 'tablet' },
  
  // Desktop
  { name: 'Laptop 13"', width: 1280, height: 800, icon: <Monitor className="h-4 w-4" />, category: 'desktop' },
  { name: 'Desktop HD', width: 1366, height: 768, icon: <Monitor className="h-4 w-4" />, category: 'desktop' },
  { name: 'Desktop FHD', width: 1920, height: 1080, icon: <Monitor className="h-4 w-4" />, category: 'desktop' },
  { name: 'Desktop 4K', width: 3840, height: 2160, icon: <Monitor className="h-4 w-4" />, category: 'desktop' },
];

export function ResponsiveTestSuite() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentDevice, setCurrentDevice] = useState<DevicePreset | null>(null);
  const [isLandscape, setIsLandscape] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return;

    // Keyboard shortcut to toggle visibility
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        setIsVisible(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  const applyDeviceSize = (device: DevicePreset) => {
    const width = isLandscape ? device.height : device.width;
    const height = isLandscape ? device.width : device.height;
    
    // Apply to viewport (for testing purposes)
    document.documentElement.style.setProperty('--test-viewport-width', `${width}px`);
    document.documentElement.style.setProperty('--test-viewport-height', `${height}px`);
    
    setCurrentDevice(device);
    
    // Run basic responsive tests
    setTimeout(() => runResponsiveTests(device), 500);
  };

  const runResponsiveTests = (device: DevicePreset) => {
    const results: Record<string, boolean> = {};
    
    // Test sidebar behavior on mobile
    if (device.category === 'mobile') {
      const sidebar = document.querySelector('[data-testid="sidebar"]') as HTMLElement;
      const sidebarToggle = document.querySelector('[data-testid="sidebar-toggle"]') as HTMLElement;
      
      results['sidebar-hidden-mobile'] = sidebar ? 
        window.getComputedStyle(sidebar).transform.includes('translateX(-100%)') : false;
      results['sidebar-toggle-visible'] = sidebarToggle ? 
        window.getComputedStyle(sidebarToggle).display !== 'none' : false;
    }
    
    // Test responsive grid layouts
    const gridElements = document.querySelectorAll('[class*="grid-cols"]');
    results['responsive-grids'] = gridElements.length > 0;
    
    // Test text scaling
    const headings = document.querySelectorAll('h1, h2, h3');
    let textScalesCorrectly = true;
    headings.forEach(heading => {
      const fontSize = parseFloat(window.getComputedStyle(heading).fontSize);
      if (device.category === 'mobile' && fontSize > 32) {
        textScalesCorrectly = false;
      }
    });
    results['text-scaling'] = textScalesCorrectly;
    
    // Test touch targets (minimum 44px)
    const buttons = document.querySelectorAll('button, a, [role="button"]');
    let touchTargetsOk = true;
    buttons.forEach(button => {
      const rect = button.getBoundingClientRect();
      if (device.category === 'mobile' && (rect.width < 44 || rect.height < 44)) {
        touchTargetsOk = false;
      }
    });
    results['touch-targets'] = touchTargetsOk;
    
    // Test horizontal scrolling
    const hasHorizontalScroll = document.documentElement.scrollWidth > window.innerWidth;
    results['no-horizontal-scroll'] = !hasHorizontalScroll;
    
    setTestResults(results);
  };

  const resetViewport = () => {
    document.documentElement.style.removeProperty('--test-viewport-width');
    document.documentElement.style.removeProperty('--test-viewport-height');
    setCurrentDevice(null);
    setTestResults({});
  };

  if (process.env.NODE_ENV !== 'development' || !isVisible) {
    return null;
  }

  const passedTests = Object.values(testResults).filter(Boolean).length;
  const totalTests = Object.keys(testResults).length;

  return (
    <div className="fixed top-4 left-4 z-50 max-w-sm">
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Monitor className="h-4 w-4 text-blue-500" />
              Teste Responsivo
            </CardTitle>
            <button
              onClick={() => setIsVisible(false)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Fechar teste responsivo"
            >
              ×
            </button>
          </div>
          <CardDescription className="text-xs">
            Pressione Ctrl+Shift+R para alternar
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {currentDevice && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {currentDevice.icon}
                  <span className="text-sm font-medium">{currentDevice.name}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsLandscape(!isLandscape)}
                  className="h-6 px-2"
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground">
                {isLandscape ? currentDevice.height : currentDevice.width} × {isLandscape ? currentDevice.width : currentDevice.height}px
                {isLandscape && ' (paisagem)'}
              </div>
              
              {totalTests > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={passedTests === totalTests ? "default" : "secondary"} className="text-xs">
                      {passedTests}/{totalTests} testes
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-xs">
                    {Object.entries(testResults).map(([test, passed]) => (
                      <div key={test} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${passed ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className={passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                          {test.replace(/-/g, ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <Button
                size="sm"
                variant="outline"
                onClick={resetViewport}
                className="w-full h-6 text-xs"
              >
                Resetar
              </Button>
            </div>
          )}
          
          {!currentDevice && (
            <div className="space-y-3">
              <div className="text-xs font-medium">Selecione um dispositivo:</div>
              
              {['mobile', 'tablet', 'desktop'].map(category => (
                <div key={category} className="space-y-1">
                  <div className="text-xs text-muted-foreground capitalize">{category}</div>
                  <div className="grid grid-cols-1 gap-1">
                    {devicePresets
                      .filter(device => device.category === category)
                      .map(device => (
                        <Button
                          key={device.name}
                          size="sm"
                          variant="outline"
                          onClick={() => applyDeviceSize(device)}
                          className="h-6 text-xs justify-start"
                        >
                          {device.icon}
                          <span className="ml-2">{device.name}</span>
                        </Button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}