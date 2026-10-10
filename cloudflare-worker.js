/**
 * Cloudflare Worker: CORS-Proxy nur fuer Twitchs usher-Playlist.
 *
 * Zweck: Twitchs usher.ttvnw.net sendet keine CORS-Header, deshalb kann
 * ein Browser die HLS-Master-Playlist nicht direkt laden. Dieser Worker
 * holt sie und gibt sie mit "Access-Control-Allow-Origin: *" zurueck.
 *
 * Einrichten (ganz ohne CLI, nur im Browser):
 *   1. https://dash.cloudflare.com  ->  Account erstellen / einloggen (gratis)
 *   2. Links im Menue:  Workers & Pages  ->  "Create application"
 *      ->  "Create Worker"  ->  Name z. B. "twitch-proxy"  ->  Deploy
 *   3. "Edit code" anklicken, den gesamten Inhalt dieser Datei einfuegen
 *      (alles ersetzen)  ->  "Deploy"
 *   4. Du bekommst eine URL wie:  https://twitch-proxy.DEINNAME.workers.dev
 *   5. In der Seite nutzen:
 *      ...?channel=papaplatte&hls=1&proxy=https://twitch-proxy.DEINNAME.workers.dev/?url=
 *
 * Sicherheit: Es werden nur *.ttvnw.net-URLs weitergeleitet, damit der
 * Worker nicht als offener Proxy missbraucht werden kann.
 */
export default {
  async fetch(request) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    const target = new URL(request.url).searchParams.get("url");
    if (!target) {
      return new Response("missing ?url=", { status: 400, headers: cors });
    }

    let u;
    try {
      u = new URL(target);
    } catch {
      return new Response("bad url", { status: 400, headers: cors });
    }

    // Nur Twitch-Hosts erlauben (kein offener Proxy).
    if (!/(^|\.)ttvnw\.net$/.test(u.hostname)) {
      return new Response("host not allowed", { status: 403, headers: cors });
    }

    const upstream = await fetch(u.toString(), {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    const headers = new Headers(cors);
    headers.set(
      "Content-Type",
      upstream.headers.get("Content-Type") || "application/vnd.apple.mpegurl"
    );

    return new Response(upstream.body, {
      status: upstream.status,
      headers,
    });
  },
};
