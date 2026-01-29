export async function onRequest(context) {
  const { request } = context
  const url = new URL(request.url)

  const parking = url.searchParams.get("parking")
  if (!parking) {
    return new Response("Missing parking param", { status: 400 })
  }

  let upstreamBase
  switch (parking) {
    case "gd":
      upstreamBase = "https://gd.zaparkuj.pl/api/freegroupcountervalue.json"
      break
    case "uni":
      upstreamBase = "https://gd.zaparkuj.pl/api/freegroupcountervalue-green.json"
      break
    default:
      return new Response("Invalid parking value", { status: 400 })
  }

  // Pass through all other query params
  const upstreamUrl = new URL(upstreamBase)
  for (const [key, value] of url.searchParams.entries()) {
    if (key !== "parking") {
      upstreamUrl.searchParams.append(key, value)
    }
  }

  try {
    const upstreamResp = await fetch(upstreamUrl.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    })

    const headers = new Headers({
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store"
    })

    // If upstream is not OK or not JSON → pass it through untouched
    const contentType = upstreamResp.headers.get("content-type") || ""
    if (!contentType.includes("application/json")) {
      return new Response(upstreamResp.body, {
        status: upstreamResp.status,
        headers
      })
    }

    const data = await upstreamResp.json()

    // Shape the response
    const filtered = {
      CurrentFreeGroupCounterValue: data.CurrentFreeGroupCounterValue,
      ParkingGroupName: data.ParkingGroupName,
      Timestamp: data.Timestamp
    }

    return new Response(JSON.stringify(filtered), {
      status: upstreamResp.status,
      headers
    })
  } catch (err) {
    return new Response("Upstream fetch failed", { status: 502 })
  }
}

// Compatibility wrapper
export default {
  async fetch(request, env, ctx) {
    return onRequest({
      request,
      env,
      params: {},
      waitUntil: ctx?.waitUntil?.bind(ctx)
    })
  }
}
