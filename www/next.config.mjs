/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.experiments = { asyncWebAssembly: true, layers: true };
    config.resolve.alias["foto"] = "../pkg";

    if (!isServer) {
      config.output.environment = {
        ...config.output.environment,
        asyncFunction: true,
      };
    }

    return config;
  },
};

export default nextConfig;
