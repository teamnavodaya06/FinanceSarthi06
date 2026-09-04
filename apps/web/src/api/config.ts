export const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
    // For mobile phone access over local network (e.g., 192.168.x.x or custom hostname)
    return `${protocol}//${hostname}:5000/api`;
  }
  return 'http://localhost:5000/api';
};
