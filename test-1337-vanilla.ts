import { SOURCES } from "./src/sources/registry";
async function test() {
  const src = SOURCES.find(s => s.id === 'x1337-movies');
  try {
    console.log(`Testing ${src.id}...`);
    const res = await src.search("Vanilla Sky");
    console.log(`  => OK: ${res.length} results`);
    res.slice(0, 3).forEach(r => console.log(`     - ${r.name} (Seeders: ${r.seeders})`));
  } catch (e) {
    console.log(`  => FAIL: ${e.message}`);
  }
}
test();
