const hosts = ["1337x.to", "1337x.st", "x1337x.ws", "1337xx.to", "1337x.so", "1337x.tw", "1377x.to"];
async function test() {
  for (const h of hosts) {
    try {
      const start = Date.now();
      const res = await fetch("https://" + h, { headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/111.0" }});
      console.log(`[${res.status}] ${h} - ${Date.now() - start}ms`);
    } catch (e) {
      console.log(`[ERR] ${h} - ${e.message}`);
    }
  }
}
test();
