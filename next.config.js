const path = require('path');

const projectRoot = path.resolve(__dirname);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix module resolution when workspace root is a parent directory
  turbopack: {
    root: projectRoot,
  },
  webpack: (config) => {
    // Ensure webpack resolves modules from the project directory
    config.context = projectRoot;
    config.resolve = config.resolve || {};
    config.resolve.modules = [
      path.join(projectRoot, 'node_modules'),
      ...(config.resolve.modules || []),
    ];
    // Force these to resolve from project node_modules (avoids parent /Users/jim/package.json confusing resolver)
    config.resolve.alias = {
      ...config.resolve.alias,
      tailwindcss: path.join(projectRoot, 'node_modules', 'tailwindcss'),
      'tw-animate-css': path.join(projectRoot, 'node_modules', 'tw-animate-css'),
    };
    return config;
  },
};

module.exports = nextConfig;
