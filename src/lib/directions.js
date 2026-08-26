function openDirections(lat, lng, label, mode = "walk", from) {
  const ua = navigator.userAgent;
  const isApple = /iP(hone|ad|od)|Macintosh/.test(ua);
  const q = encodeURIComponent(label || "Vesi");
  let url;
  if (isApple) {
    const dirflg = mode === "drive" ? "d" : "w";
    const saddr = from ? `&saddr=${from.lat},${from.lng}` : "";
    url = `https://maps.apple.com/?daddr=${lat},${lng}${saddr}&q=${q}&dirflg=${dirflg}`;
  } else {
    const travelmode = mode === "drive" ? "driving" : "walking";
    const origin = from ? `&origin=${from.lat},${from.lng}` : "";
    url = `https://www.google.com/maps/dir/?api=1${origin}&destination=${lat},${lng}&travelmode=${travelmode}`;
  }
  window.open(url, "_blank");
}
export {
  openDirections
};
