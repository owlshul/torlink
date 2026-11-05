import { SOURCES } from "./src/sources/registry";
async function test() {
  for (const src of SOURCES) {
    try {
      console.log(`Testing ${src.id}...`);
      const res = await src.search("Vanilla Sky");
      console.log(`  => OK: ${res.length} results`);
    } catch (e) {
      console.log(`  => FAIL: ${e.message}`);
    }
  }
}
test();
