# twitch-embed

Minimale statische Seite (ein einziges `index.html`), die einen Twitch-Stream
einbettet. Kanal kommt per URL-Parameter.

Live: https://accoding9173.github.io/twitch-embed/?channel=papaplatte

## Parameter

| Parameter    | Wirkung                                                        |
|--------------|----------------------------------------------------------------|
| `channel`    | Twitch-Kanal (nur `a-z 0-9 _`). Fehlt er, kommt eine Eingabemaske. |
| `chat=1`     | Chat daneben (Desktop) bzw. darunter (schmaler Screen).        |
| `muted=1`    | Startet stumm.                                                 |
| `hls=1`      | **Direkt-Player** statt Twitch-iframe (siehe unten).           |
| `proxy=...`  | Eigener CORS-Proxy-Prefix fuer den HLS-Modus.                  |

## Zwei Modi

### 1. Standard (iframe)
`?channel=papaplatte` nutzt Twitchs offiziellen Player-iframe. Funktioniert
auf Desktop und normalem Mobile-Web. Zusaetzlich werden `notion.so` und
`www.notion.so` als `parent` mitgegeben, damit das Einbetten in Notion (im
**Browser/Desktop**) funktioniert.

**Grenze:** In der **Notion-Handy-App** funktioniert der iframe-Player NICHT.
Mobile Apps haben keine Domain, die Twitch als `parent` akzeptiert — Twitch
blockt mit `ERR_BLOCKED_BY_RESPONSE`. Das ist ein Twitch-Limit, kein Bug.

### 2. Direkt-Player (`&hls=1`) — fuer Notion-Handy
`?channel=papaplatte&hls=1` laedt den rohen HLS-Stream in ein `<video>`.
Kein Twitch-iframe, kein `parent` noetig → laeuft dort, wo der iframe blockt.

- **iPhone:** spielt nativ, ohne Proxy.
- **Android:** braucht hls.js + einen CORS-Proxy, weil Twitchs
  `usher.ttvnw.net` (Master-Playlist) keine CORS-Header sendet.

Standardmaessig werden oeffentliche Gratis-Proxys versucht (allorigins,
codetabs). Die sind **unzuverlaessig**. Fuer stabilen Dauerbetrieb einen
eigenen Cloudflare Worker aufsetzen (kostenlos, siehe
`cloudflare-worker.js`) und dann:

```
?channel=papaplatte&hls=1&proxy=https://DEIN-WORKER.workers.dev/?url=
```

> Hinweis: Der Direkt-Player umgeht Twitchs offiziellen Player. Nutzung auf
> eigene Verantwortung; Twitch kann interne Endpunkte jederzeit aendern.
