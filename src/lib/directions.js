import { nativePlatform } from "./platform.js"

async function openUrl(url) {
  if (__NATIVE__) {
    try {
      const { AppLauncher } = await import("@capacitor/app-launcher")
      await AppLauncher.openUrl({ url })
      return
    } catch {
    }
  }
  window.open(url, "_blank")
}

function openDirections(lat, lng, label, mode = "walk", from) {
  const isApple = __NATIVE__
    ? nativePlatform() === "ios"
    : /iP(hone|ad|od)|Macintosh/.test(navigator.userAgent)
  const q = encodeURIComponent(label || "Vesi")
  let url
  if (isApple) {
    const dirflg = mode === "drive" ? "d" : "w"
    const saddr = from ? `&saddr=${from.lat},${from.lng}` : ""
    url = `https://maps.apple.com/?daddr=${lat},${lng}${saddr}&q=${q}&dirflg=${dirflg}`
  } else {
    const travelmode = mode === "drive" ? "driving" : "walking"
    const origin = from ? `&origin=${from.lat},${from.lng}` : ""
    url = `https://www.google.com/maps/dir/?api=1${origin}&destination=${lat},${lng}&travelmode=${travelmode}`
  }
  openUrl(url)
}
export {
  openDirections
}
