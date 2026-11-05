import { fetchResilient } from "./src/util/net";
async function test() {
  const url = "https://1377x.to/category-search/Vanilla+Sky/Movies/1/";
  try {
    const res = await fetchResilient(url, { headers: { "User-Agent": "Mozilla/5.0" }, retries: 1 });
    const html = await res.text();
    console.log("Status:", res.status);
    console.log("HTML length:", html.length);
    if (html.includes("Vanilla Sky") || html.includes("Vanilla.Sky")) {
      console.log("Found Vanilla Sky in HTML!");
    } else {
      console.log("Did not find Vanilla Sky in HTML.");
      console.log(html.slice(0, 500));
    }
  } catch (e) {
    console.log("FAIL:", e.message);
  }
}
test();
