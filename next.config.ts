import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transform barrel imports (lucide-react, date-fns, Radix) into direct
  // imports at build time so unused modules are not pulled in. Cuts cold-start
  // and dev/build cost without losing TypeScript types.
  // See: vercel-react-best-practices > bundle-barrel-imports.
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "date-fns",
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-avatar",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-radio-group",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
    ],
  },
};

export default nextConfig;
