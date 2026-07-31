/** @type {import('next').NextConfig} */
const nextConfig = {
  // sharp enthält native Binärdateien - darf nicht von Webpack ins Serverless-Bundle
  // gepackt werden, sondern muss als externes Node-Modul geladen werden.
  experimental: {
    serverComponentsExternalPackages: ["sharp"],
  },
};

module.exports = nextConfig;
