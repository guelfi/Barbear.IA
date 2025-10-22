import { useEffect, useRef, useCallback } from 'react';
import { PerformanceMonitor, debounce, throttle } from '../utils/performance';

export function usePerformance(componentName: string) {
  const monitor = PerformanceMonitor.getInstance();
  const renderCount = useRef(0);
  const mountTime = useRef<number>(0);

  useEffect(() => {
    // Track component mount
    mountTime.current = performance.now();
    monitor.startMeasure(`${componentName}_mount`);

    return () => {
      // Track component unmount
      monitor.endMeasure(`${componentName}_mount`);
      console.log(`${componentName} rendered ${renderCount.current} times`);
    };
  }, [componentName, monitor]);

  useEffect(() => {
    // Track each render
    renderCount.current += 1;
    monitor.startMeasure(`${componentName}_render_${renderCount.current}`);
    
    // Use requestAnimationFrame to measure after render
    const measureRender = () => {
      monitor.endMeasure(`${componentName}_render_${renderCount.current}`);
    };
    
    requestAnimationFrame(measureRender);
  });

  const measureAction = useCallback((actionName: string, action: () => void) => {
    monitor.startMeasure(`${componentName}_${actionName}`);
    action();
    monitor.endMeasure(`${componentName}_${actionName}`);
  }, [componentName, monitor]);

  const measureAsyncAction = useCallback(async (actionName: string, action: () => Promise<void>) => {
    monitor.startMeasure(`${componentName}_${actionName}`);
    try {
      await action();
    } finally {
      monitor.endMeasure(`${componentName}_${actionName}`);
    }
  }, [componentName, monitor]);

  return {
    measureAction,
    measureAsyncAction,
    renderCount: renderCount.current,
    getMetrics: () => monitor.getAllMetrics()
  };
}

export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const debouncedCallback = useRef<T | null>(null);

  useEffect(() => {
    debouncedCallback.current = debounce(callback, delay) as T;
  }, [callback, delay]);

  return debouncedCallback.current || callback;
}

export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): T {
  const throttledCallback = useRef<T | null>(null);

  useEffect(() => {
    throttledCallback.current = throttle(callback, limit) as T;
  }, [callback, limit]);

  return throttledCallback.current || callback;
}

// Hook for measuring network performance
export function useNetworkStatus() {
  const getConnectionInfo = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      return {
        effectiveType: connection?.effectiveType || 'unknown',
        downlink: connection?.downlink || 0,
        rtt: connection?.rtt || 0,
        saveData: connection?.saveData || false,
        online: navigator.onLine
      };
    }
    return {
      effectiveType: 'unknown',
      downlink: 0,
      rtt: 0,
      saveData: false,
      online: navigator?.onLine || true
    };
  }, []);

  return getConnectionInfo();
}

// Hook for intersection observer (lazy loading)
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  callback: (isIntersecting: boolean) => void,
  options?: IntersectionObserverInit
) {
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        callback(entry.isIntersecting);
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
        ...options
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
  }, [elementRef, callback, options]);
}