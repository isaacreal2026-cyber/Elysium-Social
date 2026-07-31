/**
 * Elysium Performance Service
 *
 * Performance monitoring and optimization utilities for the app.
 * Addresses the "Performance 0.22 CRITICAL" finding from the
 * 20,000-user simulation.
 *
 * This module is a NEW file — it does not alter any existing code.
 *
 * Usage:
 *   import { PerformanceService } from "@/services/performance";
 *   PerformanceService.startSpan("feed_load");
 *   // ... load feed ...
 *   PerformanceService.endSpan("feed_load");
 *   const metrics = PerformanceService.getMetrics();
 */

import { Platform } from "react-native";

// ── Types ──────────────────────────────────────────────────────

export interface PerformanceSpan {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface PerformanceMetrics {
  spans: PerformanceSpan[];
  avgFeedLoad: number;
  avgScreenTransition: number;
  avgImageLoad: number;
  memoryUsage: number | null;
  fps: number | null;
  slowFrames: number;
  totalFrames: number;
}

export interface PerformanceConfig {
  enabled: boolean;
  slowThreshold: number;     // ms — anything above this is "slow"
  criticalThreshold: number; // ms — anything above this is "critical"
  maxSpans: number;          // max spans to keep in memory
  enableFPS: boolean;
  enableMemory: boolean;
  reportInterval: number;    // ms between automatic reports
}

const DEFAULT_CONFIG: PerformanceConfig = {
  enabled: true,
  slowThreshold: 500,
  criticalThreshold: 2000,
  maxSpans: 100,
  enableFPS: true,
  enableMemory: true,
  reportInterval: 30000,
};

// ── Service ────────────────────────────────────────────────────

class PerformanceServiceImpl {
  private spans: Map<string, PerformanceSpan> = new Map();
  private completedSpans: PerformanceSpan[] = [];
  private config: PerformanceConfig = DEFAULT_CONFIG;
  private frameCount = 0;
  private slowFrameCount = 0;
  private lastFrameTime = 0;
  private fpsInterval: ReturnType<typeof setInterval> | null = null;
  private reportInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Initialize performance monitoring.
   */
  init(): void {
    if (!this.config.enabled) return;

    if (this.config.enableFPS) {
      this.startFPSMonitoring();
    }

    // Periodic reports
    this.reportInterval = setInterval(() => {
      this.report();
    }, this.config.reportInterval);
  }

  /**
   * Stop performance monitoring.
   */
  shutdown(): void {
    if (this.fpsInterval) clearInterval(this.fpsInterval);
    if (this.reportInterval) clearInterval(this.reportInterval);
  }

  /**
   * Start a performance span.
   */
  startSpan(name: string, metadata?: Record<string, any>): void {
    if (!this.config.enabled) return;

    this.spans.set(name, {
      name,
      startTime: performance.now(),
      metadata,
    });
  }

  /**
   * End a performance span.
   */
  endSpan(name: string, metadata?: Record<string, any>): void {
    if (!this.config.enabled) return;

    const span = this.spans.get(name);
    if (!span) return;

    span.endTime = performance.now();
    span.duration = span.endTime - span.startTime;
    if (metadata) span.metadata = { ...span.metadata, ...metadata };

    this.spans.delete(name);

    // Track slow operations
    if (span.duration > this.config.slowThreshold) {
      console.warn(`[ElysiumPerf] Slow: ${name} took ${span.duration.toFixed(0)}ms`);
    }
    if (span.duration > this.config.criticalThreshold) {
      console.error(`[ElysiumPerf] CRITICAL: ${name} took ${span.duration.toFixed(0)}ms`);
    }

    // Store completed spans
    this.completedSpans.push(span);
    if (this.completedSpans.length > this.config.maxSpans) {
      this.completedSpans.shift();
    }
  }

  /**
   * Get current performance metrics.
   */
  getMetrics(): PerformanceMetrics {
    const feedSpans = this.completedSpans.filter((s) => s.name.includes("feed"));
    const screenSpans = this.completedSpans.filter((s) => s.name.includes("screen"));
    const imageSpans = this.completedSpans.filter((s) => s.name.includes("image"));

    return {
      spans: [...this.completedSpans],
      avgFeedLoad: feedSpans.length
        ? feedSpans.reduce((a, s) => a + (s.duration ?? 0), 0) / feedSpans.length
        : 0,
      avgScreenTransition: screenSpans.length
        ? screenSpans.reduce((a, s) => a + (s.duration ?? 0), 0) / screenSpans.length
        : 0,
      avgImageLoad: imageSpans.length
        ? imageSpans.reduce((a, s) => a + (s.duration ?? 0), 0) / imageSpans.length
        : 0,
      memoryUsage: this.getMemoryUsage(),
      fps: this.frameCount > 0 ? this.frameCount / 1 : null,
      slowFrames: this.slowFrameCount,
      totalFrames: this.frameCount,
    };
  }

  /**
   * Update configuration.
   */
  updateConfig(config: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Clear all stored metrics.
   */
  clearMetrics(): void {
    this.completedSpans = [];
    this.frameCount = 0;
    this.slowFrameCount = 0;
  }

  // ── Optimization helpers ─────────────────────────────────────

  /**
   * Debounce a function call.
   */
  static debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: number,
  ): (...args: Parameters<T>) => void {
    let timer: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  /**
   * Throttle a function call.
   */
  static throttle<T extends (...args: any[]) => any>(
    fn: T,
    limit: number,
  ): (...args: Parameters<T>) => void {
    let lastCall = 0;
    return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= limit) {
        lastCall = now;
        fn(...args);
      }
    };
  }

  /**
   * Memoize a function with a cache.
   */
  static memoize<T extends (...args: any[]) => any>(
    fn: T,
    keyFn?: (...args: Parameters<T>) => string,
  ): T {
    const cache = new Map<string, ReturnType<T>>();
    return ((...args: Parameters<T>) => {
      const key = keyFn ? keyFn(...args) : JSON.stringify(args);
      if (cache.has(key)) return cache.get(key);
      const result = fn(...args);
      cache.set(key, result);
      return result;
    }) as T;
  }

  /**
   * Create a lazy loader that only loads when needed.
   */
  static lazyLoad<T>(loader: () => Promise<T>): () => Promise<T> {
    let cached: T | null = null;
    let promise: Promise<T> | null = null;
    return () => {
      if (cached) return Promise.resolve(cached);
      if (promise) return promise;
      promise = loader().then((result) => {
        cached = result;
        return result;
      });
      return promise;
    };
  }

  // ── Private helpers ──────────────────────────────────────────

  private startFPSMonitoring(): void {
    this.lastFrameTime = performance.now();

    const measureFrame = () => {
      const now = performance.now();
      const delta = now - this.lastFrameTime;
      this.lastFrameTime = now;
      this.frameCount++;

      // A frame is "slow" if it takes more than 16.67ms (60fps)
      if (delta > 16.67 * 2) {
        this.slowFrameCount++;
      }

      // Use requestAnimationFrame on web, setTimeout on native
      if (typeof requestAnimationFrame === "function") {
        requestAnimationFrame(measureFrame);
      } else {
        setTimeout(measureFrame, 16);
      }
    };

    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(measureFrame);
    } else {
      setTimeout(measureFrame, 16);
    }
  }

  private getMemoryUsage(): number | null {
    if (!this.config.enableMemory) return null;

    try {
      // @ts-ignore — performance.memory is Chrome-only
      const memory = performance.memory;
      if (memory) {
        return memory.usedJSHeapSize / (1024 * 1024); // MB
      }
    } catch {
      // Not available
    }
    return null;
  }

  private report(): void {
    const metrics = this.getMetrics();
    const avgFeed = metrics.avgFeedLoad.toFixed(0);
    const avgScreen = metrics.avgScreenTransition.toFixed(0);
    const slowCount = metrics.slowFrames;

    if (metrics.avgFeedLoad > this.config.slowThreshold) {
      console.warn(`[ElysiumPerf] Feed avg: ${avgFeed}ms (SLOW)`);
    }
    if (metrics.avgScreenTransition > this.config.slowThreshold) {
      console.warn(`[ElysiumPerf] Screen avg: ${avgScreen}ms (SLOW)`);
    }
    if (slowCount > 0) {
      console.warn(`[ElysiumPerf] Slow frames: ${slowCount}/${metrics.totalFrames}`);
    }
  }
}

export const PerformanceService = new PerformanceServiceImpl();
