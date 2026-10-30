import { registerHooks } from "node:module";

const projectRoot = new URL("../", import.meta.url);

// Node 24 executa os módulos TypeScript; resolver os mesmos imports usados pelo Next.js.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      return nextResolve(new URL(`src/${specifier.slice(2)}.ts`, projectRoot).href, context);
    }
    if (context.parentURL?.includes("/src/app/lib/chatbot/") && specifier.startsWith("./")) {
      return nextResolve(`${specifier}.ts`, context);
    }
    return nextResolve(specifier, context);
  },
});
