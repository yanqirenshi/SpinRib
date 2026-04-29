/** @type {import('next').NextConfig} */
const nextConfig = {
  // The spinrib package ships React source as .jsx (no precompiled
  // dist), so Next.js needs to be told to transpile it.
  transpilePackages: ['spinrib'],
};

export default nextConfig;
