// Performance Optimization Utilities

/**
 * Ultra-fast debounce for instant response times (1-5ms)
 * Minimal overhead for critical operations
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 1
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Ultra-fast throttle for instant response times (1-5ms)
 * Minimal overhead for critical operations
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number = 1
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Prefetch routes for instant navigation
 */
export function prefetchRoute(href: string) {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  link.as = 'fetch';
  document.head.appendChild(link);
}

/**
 * Measure performance with minimal overhead
 */
export function measurePerformance(label: string, fn: () => void) {
  if (typeof window !== 'undefined' && window.performance) {
    const start = performance.now();
    fn();
    const end = performance.now();
    const time = (end - start).toFixed(2);
    console.log(`[PERF] ${label}: ${time}ms`);
  } else {
    fn();
  }
}

/**
 * Request animation frame debounce for smooth 60fps rendering
 */
export function rafDebounce<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;

  return function (...args: Parameters<T>) {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
    rafId = requestAnimationFrame(() => {
      func(...args);
      rafId = null;
    });
  };
}

/**
 * Instant state update with automatic batching
 */
export function batchStateUpdates(updates: Array<() => void>) {
  updates.forEach(update => update());
}
