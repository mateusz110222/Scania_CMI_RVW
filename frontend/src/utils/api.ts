export const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface FetchJSONOptions {
  method?: HttpMethod;
  timeout?: number;
}

export interface ApiResponse {
  status: boolean;
  message?: string;
  data?: string | [] | null;
}

interface ApiError extends Error {
  status?: number;
  payload?: unknown;
}

export async function fetchJSON<T = unknown>(
  filepath: string,
  payload: Record<string, unknown> = {},
  { method = 'POST', timeout = 10000 }: FetchJSONOptions = {},
): Promise<{
  status: boolean;
  message: string;
  data: T | null;
}> {
  const url = new URL(`${API_BASE}${filepath}`, window.location.origin);

  if (method === 'GET') {
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const ctrl = new AbortController();
  const timeoutId = setTimeout(() => {
    ctrl.abort(new Error('Request timed out'));
  }, timeout);

  let resp: Response;

  try {
    const init: RequestInit = {
      method,
      headers: {},
      signal: ctrl.signal,
    };

    if (method !== 'GET') {
      init.headers = {
        'Content-Type': 'application/json',
      };
      init.body = JSON.stringify(payload);
    }

    resp = await fetch(url, init);
  } catch (error) {
    clearTimeout(timeoutId);

    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Network error: ${message}`, { cause: error });
  }

  clearTimeout(timeoutId);

  let raw: string;

  try {
    raw = await resp.text();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to read response: ${message}`, { cause: error });
  }

  const contentType = (resp.headers.get('content-type') || '').toLowerCase();

  if (!contentType.includes('application/json')) {
    const snippet = raw.slice(0, 200).replace(/\s+/g, ' ');
    throw new Error(
      `Unexpected content-type (${contentType || 'none'}). HTTP ${resp.status}. Body: ${snippet}`,
    );
  }

  let data: ApiResponse;

  try {
    data = raw ? JSON.parse(raw) : {};
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid JSON: ${message}. Raw: ${raw.slice(0, 200)}`, {
      cause: error,
    });
  }

  if (!resp.ok) {
    const message = data?.message || resp.statusText || `HTTP ${resp.status}`;
    const err: ApiError = new Error(message);
    err.status = resp.status;
    err.payload = data;
    throw err;
  }

  if (typeof data !== 'object' || data === null || !('status' in data)) {
    throw new Error(
      `Malformed payload: missing "status". Got: ${JSON.stringify(data)}`,
    );
  }

  if (!data.status) {
    const err: ApiError = new Error(data.message || 'Server reported failure');
    err.payload = data;
    throw err;
  }

  return {
    status: data.status,
    message: data.message ?? '',
    data: (data.data ?? null) as T | null,
  };
}

export async function fetchSVGText(url: string, date: string): Promise<string> {
  try {
    const response = await fetch(`${API_BASE}${url}`, { method: 'GET' });

    if (!response.ok) {
      throw new Error(`Błąd HTTP: ${response.status}`);
    }

    let svgText = await response.text();

    const backendBaseUrl = `${API_BASE}/file/${date}/`;

    svgText = svgText.replace(
      /xlink:href="([^"]+\.jpg)"/g,
      `xlink:href="${backendBaseUrl}$1"`,
    );

    return svgText;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Błąd pobierania SVG: ${message}`, { cause: error });
  }
}
