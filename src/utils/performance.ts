// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Measure component render time
  startMeasure(name: string): void {
    this.metrics.set(`${name}_start`, performance.now());
  }

  endMeasure(name: string): number {
    const startTime = this.metrics.get(`${name}_start`);
    if (!startTime) return 0;
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    this.metrics.set(name, duration);
    console.log(`Performance: ${name} took ${(duration || 0).toFixed(2)}ms`);
    
    return duration;
  }

  // Get metric value
  getMetric(name: string): number | undefined {
    return this.metrics.get(name);
  }

  // Clear all metrics
  clear(): void {
    this.metrics.clear();
  }

  // Get all metrics
  getAllMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }
}

// Memory leak detection
export function detectMemoryLeaks(): void {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const memory = (performance as any).memory;
    if (memory) {
      console.log('Memory Usage:', {
        used: `${Math.round(memory.usedJSHeapSize / 1048576)} MB`,
        total: `${Math.round(memory.totalJSHeapSize / 1048576)} MB`,
        limit: `${Math.round(memory.jsHeapSizeLimit / 1048576)} MB`
      });
    }
  }
}

// Network performance monitoring
export function measureNetworkPerformance(): void {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    console.log('Network Info:', {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    });
  }
}

// Debounce utility for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle utility for performance optimization
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Image lazy loading utility
export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }

  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  });
}

// Bundle size analyzer (development only)
export function analyzeBundleSize(): void {
  if (process.env.NODE_ENV === 'development') {
    const scripts = document.querySelectorAll('script[src]');
    let totalSize = 0;

    scripts.forEach(script => {
      const src = (script as HTMLScriptElement).src;
      if (src.includes('localhost') || src.includes('127.0.0.1')) {
        fetch(src)
          .then(response => response.blob())
          .then(blob => {
            const size = blob.size / 1024; // KB
            totalSize += size;
            console.log(`Script ${src}: ${(size || 0).toFixed(2)} KB`);
          })
          .catch(console.error);
      }
    });

    setTimeout(() => {
      console.log(`Total bundle size: ~${(totalSize || 0).toFixed(2)} KB`);
    }, 1000);
  }
}
