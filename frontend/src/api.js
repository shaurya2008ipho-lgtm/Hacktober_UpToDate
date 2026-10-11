const API_ROOT = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export async function api(path, options = {}) {
  const token = sessionStorage.getItem('acrm_access_token');
  const headers = { ...(options.headers || {}) };
  if (options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
  if (token && !options.noAuth) headers.Authorization = `Bearer ${token}`;
  const { noAuth, ...fetchOptions } = options;
  let response;
  try {
    response = await fetch(`${API_ROOT}${path}`, { ...fetchOptions, headers });
  } catch (err) {
    throw new Error('Cannot reach the ACRM API. Make sure the FastAPI backend is running on port 8000.');
  }
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();
  if (!response.ok) {
    const detail = typeof data === 'object' && data ? data.detail : null;
    throw new Error(detail || `Request failed (${response.status}).`);
  }
  return data;
}
