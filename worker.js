const TURATH_BASE = "https://app.turath.io";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

async function serveApp(request, env) {
  if (env && env.ASSETS) {
    const assetUrl = new URL("/index.html", request.url);
    return env.ASSETS.fetch(new Request(assetUrl.toString()));
  }
  return new Response(
    '<!DOCTYPE html><html lang="id"><body style="font-family:sans-serif;padding:2rem;text-align:center">' +
    '<h2>Aplikasi Gambar, Hitung &amp; Bangun Rumah</h2>' +
    '<p>Deploy menggunakan <code>wrangler deploy</code> agar aplikasi dapat diakses.</p>' +
    '</body></html>',
    { headers: { "Content-Type": "text/html;charset=UTF-8" } }
  );
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const params = url.searchParams;

    if (path === "/" || path === "" || path === "/index.html") {
      return serveApp(request, env);
    }

    try {
      if (path === "/search") {
        const q = params.get("q");
        if (!q) return json({ error: "Parameter q wajib diisi" }, 400);
        const p = params.get("page") || "1";
        const cat = params.get("cat");
        const author = params.get("author");
        let apiUrl = `${TURATH_BASE}/api/search?q=${encodeURIComponent(q)}&page=${p}`;
        if (cat) apiUrl += `&category=${cat}`;
        if (author) apiUrl += `&author=${author}`;
        const res = await fetch(apiUrl, { headers: { "Accept": "application/json" } });
        const data = await res.json();
        return json(data);
      }

      if (path === "/book") {
        const id = params.get("id");
        if (!id) return json({ error: "Parameter id wajib diisi" }, 400);
        const res = await fetch(`${TURATH_BASE}/api/book?id=${id}`, { headers: { "Accept": "application/json" } });
        const data = await res.json();
        return json(data);
      }

      if (path === "/page") {
        const id = params.get("id");
        const page = params.get("page") || "1";
        if (!id) return json({ error: "Parameter id wajib diisi" }, 400);
        const res = await fetch(`${TURATH_BASE}/api/book_page?book_id=${id}&page=${page}`, { headers: { "Accept": "application/json" } });
        const data = await res.json();
        return json(data);
      }

      if (path === "/author") {
        const id = params.get("id");
        if (!id) return json({ error: "Parameter id wajib diisi" }, 400);
        const res = await fetch(`${TURATH_BASE}/api/author?id=${id}`, { headers: { "Accept": "application/json" } });
        const data = await res.json();
        return json(data);
      }

      return json({ error: "Endpoint tidak ditemukan" }, 404);

    } catch (err) {
      return json({ error: "Error: " + err.message }, 500);
    }
  },
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS });
}
