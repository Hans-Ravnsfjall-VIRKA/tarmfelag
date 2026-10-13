import { Geolocation } from "@capacitor/geolocation"

async function ensurePermission() {
  try {
    let p = await Geolocation.checkPermissions()
    if (p.location !== "granted") p = await Geolocation.requestPermissions({ permissions: ["location"] })
    return p.location === "granted"
  } catch {
    return false
  }
}

export async function nativePosition(timeout, maximumAge, withAccuracy) {
  if (!(await ensurePermission())) return null
  try {
    const p = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout, maximumAge })
    const out = { lat: p.coords.latitude, lng: p.coords.longitude }
    if (withAccuracy) out.accuracy = p.coords.accuracy
    return out
  } catch {
    return null
  }
}

export async function nativeWatch(onFix, onUnavailable) {
  if (!(await ensurePermission())) {
    onUnavailable()
    return () => {}
  }
  const id = await Geolocation.watchPosition(
    { enableHighAccuracy: true, maximumAge: 1000, timeout: 20000 },
    (p, err) => {
      if (p) onFix({ lat: p.coords.latitude, lng: p.coords.longitude, heading: p.coords.heading, acc: p.coords.accuracy })
    }
  )
  return () => { Geolocation.clearWatch({ id }) }
}
