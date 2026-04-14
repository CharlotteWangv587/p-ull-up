import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Ensures Turbopack resolves deps from this app folder,
    // even if other lockfiles exist elsewhere on the machine.
    root: __dirname,
  },
};

export default nextConfig;
