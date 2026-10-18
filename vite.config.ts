import { defineConfig, lazyPlugins } from "vite-plus";
import { voidPlugin } from "void";

export default defineConfig({
  fmt: {},
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    // Use TypeScript separately: Oxlint does not resolve Void's generated types here.
    options: { typeAware: false, typeCheck: false },
  },
  plugins: lazyPlugins(() => [voidPlugin()]),
});
