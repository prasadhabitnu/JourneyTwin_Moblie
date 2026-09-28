import { parseIntent } from "../lib/nuVoice";

const tests = [
  "Whatsup Nu, take me to CGM",
  "Whatsup Nu, show me my rewards",
  "hey nu, message my coach",
  "whats up nu I want to see my journey",
  "nu, open the care circle",
  "whatsup nu, home",
  "whatsup nu what should I do today",
  "whatsup nu, teach me something new",
  "whatsup nu, how am I doing this week",
  "hey nu, gibberish qwerty",
];

for (const t of tests) {
  const r = parseIntent(t);
  const label = r.matched
    ? `→ ${r.target?.name ?? "home"} (${r.route}, conf ${(r.confidence * 100).toFixed(0)}%, ${r.reason})`
    : `→ NO MATCH (${r.reason})`;
  console.log(`"${t}"`);
  console.log(`  ${label}`);
}
