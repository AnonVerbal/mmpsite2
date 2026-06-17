/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // As imagens hoje vêm por <img> com URL externa (acervo MMP).
  // Ao migrar para arquivos locais otimizados, considere usar next/image.
};

export default nextConfig;
