/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  transpilePackages: ['@sparticuz/chromium'],
  webpack: (config, { isServer }) => {
    // For client-side bundles, ignore node modules that should only be used on server
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        child_process: false,
        readline: false,
        'aws-crt': false,
        module: false,
        path: false,
        os: false,
        url: false,
        http: false,
        https: false,
        zlib: false,
        stream: false,
        crypto: false,
        'node:fs': false,
        'node:os': false,
        'node:path': false,
        'node:url': false,
        'node:http': false,
        'node:https': false,
        'node:zlib': false,
        'node:stream': false,
        'node:crypto': false,
        'node:util': false,
      };

      // Tell webpack to ignore all puppeteer and @sparticuz/chromium modules on client
      config.module.rules.push({
        test: /\.js$/,
        include: [
          /node_modules\/puppeteer/,
          /node_modules\/@sparticuz\/chromium/,
          /node_modules\/chrome-aws-lambda/,
        ],
        use: 'null-loader'
      });

      // Properly exclude server-only modules
      config.externals.push({
        'puppeteer': 'commonjs puppeteer',
        'puppeteer-core': 'commonjs puppeteer-core',
        '@sparticuz/chromium': 'commonjs @sparticuz/chromium',
        'chrome-aws-lambda': 'commonjs chrome-aws-lambda',
      });
    }

    return config;
  },
  // Ensure puppeteer is only bundled for server-side
  serverRuntimeConfig: {
    // Will only be available on the server side
    puppeteer: true,
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    staticFolder: '/static',
  },
}; 