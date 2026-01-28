export async function onRequest(context) {
  const { request } = context
  const url = new URL(request.url)
  const target = url.searchParams.get("url")

  if (!target) {
    return new Response("Missing url param", { status: 400 })
  }

  try {
    let targetUrl
    try {
      targetUrl = new URL(target)
    } catch (e) {
      return new Response("Invalid target URL", { status: 400 })
    }

    // allow only zaparkuj.pl and its subdomains
    const allowedHost = "zaparkuj.pl"
    const host = targetUrl.hostname || ""
    if (host !== allowedHost && !host.endsWith(`.${allowedHost}`)) {
      return new Response("Forbidden target host", { status: 403 })
    }

    if (!["http:", "https:"].includes(targetUrl.protocol)) {
      return new Response("Unsupported protocol", { status: 400 })
    }

    const resp = await fetch(targetUrl.toString(), { headers: { "User-Agent": "Mozilla/5.0" } })
    const contentType = resp.headers.get("content-type") || "application/json"
    const headers = new Headers({
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store"
    })
    return new Response(resp.body, { status: resp.status, headers })
  } catch (err) {
    return new Response("Upstream fetch failed", { status: 502 })
  }
}

// Compatibility wrapper for modules expecting a default { fetch } export
export default {
  async fetch(request, env, ctx) {
    return onRequest({ request, env, params: {}, waitUntil: ctx?.waitUntil?.bind(ctx) })
  }
}
