// True only in the Capacitor build (vite --mode native). In the web build the
// bundler replaces __NATIVE__ with false, so native-only code is dropped.
export const IS_NATIVE = __NATIVE__

export function nativePlatform() {
  if (!IS_NATIVE) return "web"
  try {
    return window.Capacitor.getPlatform()
  } catch {
    return "web"
  }
}
