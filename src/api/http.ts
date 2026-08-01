const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '');

export const useRealApi = Boolean(API_URL);

function readToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('authToken');
  } catch {
    return null;
  }
}

export class ApiHttpError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown, message?: string) {
    super(message || `HTTP ${status}`);
    this.status = status;
    this.body = body;
  }
}

type QueryValue = string | number | boolean | null | undefined;
type HttpOptions = {
  token?: string | null;
  skipAuth?: boolean;
  query?: Record<string, QueryValue>;
};

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const url = new URL(`${API_URL}${path.startsWith('/') ? path : `/${path}`}`);
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  });
  return url.toString();
}

function errorMessage(status: number, body: unknown): string {
  if (typeof body === 'string' && body.trim()) return body;
  if (body && typeof body === 'object') {
    const value = body as Record<string, unknown>;
    if (typeof value.error === 'string' && value.error) return value.error;
    if (typeof value.title === 'string' && value.title) return value.title;
  }
  return `Erro HTTP ${status}`;
}

function clearTokens(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  } catch {
    // Armazenamento pode estar indisponível; a resposta HTTP continua válida.
  }
}

export async function http<T>(
  method: string,
  path: string,
  body?: unknown,
  options?: HttpOptions
): Promise<T> {
  if (!API_URL) {
    throw new Error('VITE_API_URL não configurada');
  }

  const token = options?.token ?? readToken();
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (!options?.skipAuth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path, options?.query), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }

  if (!response.ok) {
    if (response.status === 401) clearTokens();
    throw new ApiHttpError(response.status, parsed, errorMessage(response.status, parsed));
  }

  return parsed as T;
}

export const get = <T>(path: string, options?: HttpOptions) => http<T>('GET', path, undefined, options);
export const post = <T>(path: string, body?: unknown, options?: HttpOptions) => http<T>('POST', path, body, options);
export const put = <T>(path: string, body?: unknown, options?: HttpOptions) => http<T>('PUT', path, body, options);
export const del = <T>(path: string, options?: HttpOptions) => http<T>('DELETE', path, undefined, options);
