export interface ConflictError {
  message: string;
  conflicts: Array<{
    id: string;
    startTime: string;
    endTime: string;
    user: {
      firstName: string;
      lastName: string;
      role: string;
    };
  }>;
  canOverride?: boolean;
}

export interface ApiErrorResponse {
  message?: string;
  statusCode?: number;
  error?: string;
  conflicts?: ConflictError['conflicts'];
}

export function isApiError(error: unknown): error is ApiErrorResponse {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('message' in error || 'conflicts' in error)
  );
}

export function isConflictError(error: unknown): error is ConflictError {
  return (
    isApiError(error) &&
    Array.isArray((error as ConflictError).conflicts)
  );
}