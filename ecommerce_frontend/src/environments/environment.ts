export const environment = {
  production: false,
  /**
   * API base URL for the backend.
   *
   * Preference order:
   * - NG_APP_API_BASE
   * - NG_APP_BACKEND_URL
   * - default: http://localhost:3001
   *
   * Note: In many Angular setups env vars are injected at build time. This app also
   * supports runtime injection via `window.__env` in `index.html` if present.
   */
  apiBaseUrl: '',
};
