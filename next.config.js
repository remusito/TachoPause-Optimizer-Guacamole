/** @type {import('next').NextConfig} */

// const withPWAInit = require('@ducanh2912/next-pwa');

// const withPWA = withPWAInit({
//   dest: 'public',
//   disable: process.env.NODE_ENV === 'development',
//   register: true,
//   workboxOptions: {
//     babelPresetEnvTargets: ['> 0.5%', 'not IE 11'],
//   },
// });

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  env: {
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  },
};

module.exports = nextConfig;
