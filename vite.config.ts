import { defineConfig, lazyPlugins } from "vite-plus";
import { voidPlugin } from "void";
import { voidReact } from "@void/react/plugin";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  fmt: {},
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: false, typeCheck: false },
    overrides: [
      {
        files: [
          "src/pages/**/*.tsx",
          "src/components/**/*.tsx",
          "src/features/**/components/**/*",
          "src/features/**/client/**/*",
          "src/features/**/contracts/**/*",
        ],
        rules: {
          "no-restricted-imports": [
            "error",
            {
              patterns: [
                {
                  group: [
                    "**/server/**",
                    "**/db/**",
                    "@schema",
                    "void/db",
                    "void/schema-*",
                    "**/*.server",
                    "**/*.server.ts",
                  ],
                  allowTypeImports: true,
                  message:
                    "Client modules must not import server implementations. Use a type-only import for loader props.",
                },
              ],
            },
          ],
        },
      },
    ],
  },
  plugins: lazyPlugins(() => [voidPlugin(), voidReact(), tailwindcss()]),
});
