export const getApiBaseUrl = (): string => {
  // 1. Explicit Environment Variable set at deployment time (Vercel, Render, Railway, Docker)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;

    // 2. Localhost machine development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }

    // 3. Local Wi-Fi Network IP (e.g., phone browsing via 192.168.x.x:3000)
    if (/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(hostname)) {
      return `http://${hostname}:5000/api`;
    }

    // 4. Production HTTPS Domain (e.g., financesarthi.tech)
    // Relative /api allows production reverse proxies (Nginx/Vercel/Cloudflare) to route requests cleanly without SSL port 5000 mixed-content blocks
    return '/api';
  }

  return 'http://localhost:5000/api';
};
