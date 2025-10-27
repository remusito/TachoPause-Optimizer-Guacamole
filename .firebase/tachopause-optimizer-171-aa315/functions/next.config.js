"use strict";

// next.config.js
var nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**"
      }
    ]
  },
  env: {
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY
  }
};
module.exports = nextConfig;
