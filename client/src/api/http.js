const BASE = '/api';

async function request(path, options = {}) {
  // FormData (subida de archivos): el navegador pone su propio Content-Type con
  // el boundary correcto -- forzar 'application/json' rompería la petición.
  const esFormData = options.body instanceof FormData;

  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include', // manda la cookie httpOnly del JWT
    headers: esFormData ? options.headers : { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error ?? `Error ${res.status}`);
  }

  return data;
}

export const http = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: body && JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
  postForm: (path, formData) => request(path, { method: 'POST', body: formData }),
};
