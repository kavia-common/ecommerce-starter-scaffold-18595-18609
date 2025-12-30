export interface ApiErrorPayload {
  code?: number;
  status?: string;
  message?: string;
  errors?: Record<string, unknown>;
}

/**
 * PUBLIC_INTERFACE
 * Format a user-friendly message from unknown API errors.
 */
export function formatApiError(err: unknown): string {
  if (!err) return 'Unknown error';
  if (typeof err === 'string') return err;

  // HttpErrorResponse-ish
  const anyErr = err as any;
  const payload: ApiErrorPayload | undefined = anyErr?.error;

  if (payload?.message) return payload.message;
  if (anyErr?.message) return anyErr.message;

  try {
    return JSON.stringify(err);
  } catch {
    return 'Unknown error';
  }
}
