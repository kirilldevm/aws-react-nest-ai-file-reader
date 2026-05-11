const trimTrailingSlash = (url: string) => url.replace(/\/$/, '');

export const API_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000',
);
