import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const baseUrl = process.env.VITE_BASE_URL || '/';
  const baseUrlWithoutTrailingSlash = baseUrl.replace(/\/$/, '');
  const apiProxyPath = baseUrl === '/' ? '/api' : `${baseUrl}api`;

  return {
    base: baseUrl,
    server: {
      host: "::",
      port: 8080,
      proxy: {
        [apiProxyPath]: {
          target: 'http://127.0.0.1:3001',
          changeOrigin: true,
          rewrite: baseUrlWithoutTrailingSlash === ''
            ? undefined
            : (path) => {
                console.log(`[Proxy] Original path: ${path}`);
                const newPath = path.replace(baseUrlWithoutTrailingSlash, '');
                console.log(`[Proxy] Rewritten path: ${newPath}`);
                return newPath;
              },
        },
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
