import { renderToString } from "react-dom/server";
import App from "../src/App";
const html = renderToString(<App />).replace(/<!--.*?-->/g, "");
const checks: [string, boolean][] = [
  ["ribbon present", html.includes("Sample data — not verified")],
  ["intake first question", html.includes("How are your grades?")],
  ["progress visible", html.includes("1 of 6")],
  ["bottom nav", html.includes("Pathway") && html.includes("Compare")],
];
for (const [name, ok] of checks) console.log((ok ? "PASS" : "FAIL") + " " + name);
if (checks.some(([, ok]) => !ok)) process.exit(1);
