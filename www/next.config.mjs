/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.experiments = { asyncWebAssembly: true, layers: true };
    config.resolve.alias["foto"] = "../pkg";
    return config;
  },
};

export default nextConfig;
