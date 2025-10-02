/** @type {import('next').NextConfig} */
import withPWA from "next-pwa";

const isDev = process.env.NODE_ENV === "development";

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "tinyurl.com" },
      { protocol: "https", hostname: "media.gettyimages.com" },
      { protocol: "https", hostname: "static01.nyt.com" },
      { protocol: "https", hostname: "www.hindustantimes.com" },
      { protocol: "https", hostname: "encrypted-tbn0.gstatic.com" },
      { protocol: "https", hostname: "i.ibb.co" },
      { protocol: "https", hostname: "source.unsplash.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" }
    ],
  },
  serverActions: {
    bodySizeLimit: "4mb",
  },
};

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: isDev,
});

export default pwaConfig(nextConfig);
