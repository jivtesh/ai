// Fullscreen kiosk on first touch; the intent survives refresh, and the
// next touch after a reload re-enters fullscreen (browsers require a gesture).

const KEY = "booth.kiosk.v2";

function wantsKiosk(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

function rememberKiosk() {
  try {
    localStorage.setItem(KEY, "1");
  } catch {
    // ignore
  }
}

async function enter() {
  const el = document.documentElement;
  if (document.fullscreenElement) return;
  try {
    await el.requestFullscreen({ navigationUI: "hide" });
  } catch {
    // denied or unsupported: kiosk still works windowed
  }
}

export function startKiosk() {
  const onFirstTouch = () => {
    rememberKiosk();
    void enter();
  };
  window.addEventListener("pointerdown", onFirstTouch, { passive: true });
  if (wantsKiosk()) {
    // after a refresh, any interaction restores fullscreen
    const restore = () => void enter();
    window.addEventListener("pointerdown", restore, { passive: true });
  }
}
