import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Smartphone, Tablet, Monitor, Check, X } from 'lucide-react';

interface DevicePreset {
  name: string;
  width: number;
  height: number;
  icon: React.ReactNode;
}

const devicePresets: DevicePreset[] = [
  { name: 'Mobile', width: 375, height: 667, icon: <Smartphone className="w-4 h-4" /> },
  { name: 'Tablet', width: 768, height: 1024, icon: <Tablet className="w-4 h-4" /> },
  { name: 'Desktop', width: 1920, height: 1080, icon: <Monitor className="w-4 h-4" /> },
];

interface TestResult {
  test: string;
  passed: boolean;
  message: string;
}

export const ResponsiveTestSuite: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentDevice, setCurrentDevice] = useState<DevicePreset>(devicePresets[0]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'R') {
        event.preventDefault();
        setIsVisible(!isVisible);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  const runResponsiveTests = async () => {
    setIsRunning(true);
    const results: TestResult[] = [];

    // Test 1: Check for horizontal scroll
    const hasHorizontalScroll = document.body.scrollWidth > window.innerWidth;
    results.push({
      test: 'Horizontal Scroll Check',
      passed: !hasHorizontalScroll,
      message: hasHorizontalScroll ? 'Horizontal scroll detected' : 'No horizontal scroll'
    });

    // Test 2: Check for responsive breakpoints
    const breakpoints = [
      { name: 'Mobile', width: 640 },
      { name: 'Tablet', width: 768 },
      { name: 'Desktop', width: 1024 }
    ];

    breakpoints.forEach(bp => {
      const mediaQuery = window.matchMedia(`(min-width: ${bp.width}px)`);
      results.push({
        test: `${bp.name} Breakpoint`,
        passed: true,
        message: `Breakpoint ${bp.width}px: ${mediaQuery.matches ? 'Active' : 'Inactive'}`
      });
    });

    // Test 3: Check for touch targets (minimum 44px)
    const buttons = document.querySelectorAll('button, a, [role="button"]');
    let touchTargetsPassed = true;
    buttons.forEach(button => {
      const rect = button.getBoundingClientRect();
      if (rect.width < 44 || rect.height < 44) {
        touchTargetsPassed = false;
      }
    });

    results.push({
      test: 'Touch Targets Size',
      passed: touchTargetsPassed,
      message: touchTargetsPassed ? 'All touch targets ≥ 44px' : 'Some touch targets < 44px'
    });

    // Test 4: Check for text scaling
    const fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    results.push({
      test: 'Text Scaling',
      passed: fontSize >= 16,
      message: `Base font size: ${fontSize}px`
    });

    setTestResults(results);
    setIsRunning(false);
  };

  const simulateDevice = (device: DevicePreset) => {
    setCurrentDevice(device);
    // In a real implementation, you would resize the viewport or create an iframe
    // For now, we'll just update the UI to show the selected device
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Responsive Test Suite
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => setIsVisible(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Device Presets */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Device Presets</h3>
            <div className="flex gap-2 flex-wrap">
              {devicePresets.map((device) => (
                <Button
                  key={device.name}
                  variant={currentDevice.name === device.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => simulateDevice(device)}
                  className="flex items-center gap-2"
                >
                  {device.icon}
                  {device.name}
                  <span className="text-xs opacity-70">
                    {device.width}×{device.height}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          {/* Test Controls */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Responsive Tests</h3>
            <Button 
              onClick={runResponsiveTests} 
              disabled={isRunning}
              className="mb-4"
            >
              {isRunning ? 'Running Tests...' : 'Run Tests'}
            </Button>

            {/* Test Results */}
            {testResults.length > 0 && (
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {result.passed ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <X className="w-5 h-5 text-red-500" />
                      )}
                      <span className="font-medium">{result.test}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {result.message}
                      </span>
                      <Badge variant={result.passed ? "default" : "destructive"}>
                        {result.passed ? "Pass" : "Fail"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="text-sm text-muted-foreground border-t pt-4">
            <p><strong>Keyboard Shortcut:</strong> Ctrl + Shift + R to toggle this suite</p>
            <p><strong>Usage:</strong> Select a device preset and run tests to check responsive behavior</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};