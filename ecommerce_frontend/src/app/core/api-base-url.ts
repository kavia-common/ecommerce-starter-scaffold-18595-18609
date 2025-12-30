import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';

/**
 * PUBLIC_INTERFACE
 * Resolve the backend API base URL from environment variables with safe fallbacks.
 *
 * Supports:
 *  - process.env.NG_APP_API_BASE (SSR / Node)
 *  - process.env.NG_APP_BACKEND_URL (SSR / Node)
 *  - window.__env.NG_APP_API_BASE (browser runtime)
 *  - window.__env.NG_APP_BACKEND_URL (browser runtime)
 *
 * Defaults to http://localhost:3001.
 */
export function resolveApiBaseUrl(): string {
  const platformId = inject(PLATFORM_ID);

  // SSR: try Node env first
  const nodeEnv = (typeof process !== 'undefined' ? (process as any).env : undefined) as
    | Record<string, string | undefined>
    | undefined;

  const fromNode = nodeEnv?.['NG_APP_API_BASE'] || nodeEnv?.['NG_APP_BACKEND_URL'];
  if (fromNode && fromNode.trim().length > 0) return sanitizeBaseUrl(fromNode);

  // Browser: allow runtime injection via window.__env (accessed via globalThis for lint compatibility)
  if (isPlatformBrowser(platformId)) {
    const g = globalThis as unknown as { __env?: Record<string, string | undefined> };
    const runtimeEnv = g.__env;
    const fromWindow = runtimeEnv?.['NG_APP_API_BASE'] || runtimeEnv?.['NG_APP_BACKEND_URL'];
    if (fromWindow && fromWindow.trim().length > 0) return sanitizeBaseUrl(fromWindow);
  }

  return 'http://localhost:3001';
}

function sanitizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, '');
}
