import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const filename = fileURLToPath(import.meta.url);
const compat = new FlatCompat({ baseDirectory: dirname(filename) });
const config = [...compat.extends("next/core-web-vitals", "next/typescript"), { ignores: [".next/**", "dist/**", "node_modules/**", "next-env.d.ts"] }, { rules: { "import/no-anonymous-default-export": "off", "@next/next/no-img-element": "off" } }];
export default config;
