// Compile project TS in memory; no test dependency or generated source files.
import { registerHooks } from "node:module";
import { readFileSync, existsSync } from "node:fs";
import { pathToFileURL, fileURLToPath } from "node:url";
import ts from "typescript";
registerHooks({
  resolve(specifier, context, next) {
    if (specifier === "cloudflare:workers") return { url: "test:cloudflare", shortCircuit: true };
    let url;
    if (specifier.startsWith("@/")) url = new URL("../src/" + specifier.slice(2), import.meta.url);
    else if (specifier.startsWith(".") && context.parentURL?.startsWith("file:"))
      url = new URL(specifier, context.parentURL);
    if (url)
      for (const suffix of ["", ".ts", ".tsx"]) {
        const path = fileURLToPath(url) + suffix;
        if (existsSync(path) && /\.tsx?$/.test(path))
          return { url: pathToFileURL(path).href, shortCircuit: true };
      }
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url === "test:cloudflare")
      return {
        format: "module",
        source: "export const env = globalThis.testEnv;",
        shortCircuit: true,
      };
    if (/\.tsx?$/.test(url))
      return {
        format: "module",
        source: ts.transpileModule(
          readFileSync(fileURLToPath(url), "utf8").replaceAll("import.meta.env.SSR", "false"),
          {
            compilerOptions: {
              target: ts.ScriptTarget.ES2022,
              module: ts.ModuleKind.ESNext,
              jsx: ts.JsxEmit.ReactJSX,
            },
          },
        ).outputText,
        shortCircuit: true,
      };
    return next(url, context);
  },
});
