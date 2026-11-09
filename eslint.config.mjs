import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextCoreWebVitals,
  {
    // Generated, vendored or separately linted code
    ignores: [".next/**", "public/**", "multiplayer/**", "scripts/**", "lib/iconly/**", "next-env.d.ts"],
  },
];

export default config;
