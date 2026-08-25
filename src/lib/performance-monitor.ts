/**
 * Real-time performance monitoring for 1ms response tracking
 */

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
}

const metrics: PerformanceMetric[] = [];
const MAX_METRICS = 100;

export const performanceMonitor = {
  /**
   * Mark the start of an operation
   */
  start(label: string): () => void {
    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      performanceMonitor.record(label, duration);
      return duration;
    };
  },

  /**
   * Record a metric
   */
  record(name: string, duration: number) {
    const metric: PerformanceMetric = {
      name,
      duration: parseFloat(duration.toFixed(2)),
      timestamp: Date.now(),
    };

    metrics.push(metric);
    if (metrics.length > MAX_METRICS) {
      metrics.shift();
    }

    // Log if in development
    if (process.env.NODE_ENV === 'development') {
      if (duration > 5) {
        console.warn(`[PERF] ${name}: ${duration.toFixed(2)}ms (slow)`);
      } else if (duration > 1) {
        console.log(`[PERF] ${name}: ${duration.toFixed(2)}ms`);
      }
    }
  },

  /**
   * Get all metrics
   */
  getMetrics() {
    return [...metrics];
  },

  /**
   * Get average duration for a metric
   */
  getAverage(name: string): number {
    const matching = metrics.filter(m => m.name === name);
    if (matching.length === 0) return 0;
    const sum = matching.reduce((acc, m) => acc + m.duration, 0);
    return parseFloat((sum / matching.length).toFixed(2));
  },

  /**
   * Get slowest operations
   */
  getSlowest(limit: number = 10): PerformanceMetric[] {
    return [...metrics].sort((a, b) => b.duration - a.duration).slice(0, limit);
  },

  /**
   * Clear all metrics
   */
  clear() {
    metrics.length = 0;
  },

  /**
   * Print performance report
   */
  printReport() {
    console.group('[PERF] Performance Report');
    const slowest = this.getSlowest(5);
    slowest.forEach(metric => {
      console.log(`${metric.name}: ${metric.duration}ms`);
    });
    console.groupEnd();
  },
};

/**
 * React hook for performance monitoring
 */
export function usePerformanceMonitor(label: string) {
  return performanceMonitor.start(label);
}
