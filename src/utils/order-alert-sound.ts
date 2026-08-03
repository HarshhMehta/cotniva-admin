/**
 * Final order alert: Urgent tone.
 * Loops until notification panel is opened (stopUrgentAlertLoop).
 */

let audioCtx: AudioContext | null = null;
let unlocked = false;
let loopTimer: ReturnType<typeof setInterval> | null = null;
let looping = false;

const LOOP_MS = 1100; // urgent phrase ~0.75s, then gap

const getCtx = () => {
  if (typeof window === "undefined") return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx || audioCtx.state === "closed") {
    audioCtx = new Ctx();
  }
  return audioCtx;
};

export function unlockOrderAlertSound() {
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  try {
    const buf = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(0);
  } catch {
    /* ignore */
  }
  unlocked = true;
  try {
    sessionStorage.setItem("cot_order_sound", "1");
  } catch {
    /* ignore */
  }
}

export function isOrderAlertUnlocked() {
  if (unlocked) return true;
  try {
    return sessionStorage.getItem("cot_order_sound") === "1";
  } catch {
    return false;
  }
}

/** Urgent triple beep — final Cotniva order alert */
export function playOrderAlertSound() {
  if (typeof window === "undefined") return;
  unlockOrderAlertSound();
  const ctx = getCtx();
  if (!ctx) return;

  const run = () => {
    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.value = 0.72;
    master.connect(ctx.destination);

    const beep = (start: number, dur: number, vol: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, now + start);
      gain.gain.exponentialRampToValueAtTime(vol, now + start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
      osc.connect(gain);
      gain.connect(master);
      osc.start(now + start);
      osc.stop(now + start + dur + 0.02);
    };

    beep(0, 0.16, 0.5);
    beep(0.22, 0.16, 0.5);
    beep(0.44, 0.26, 0.55);
  };

  if (ctx.state === "suspended") {
    ctx.resume().then(run).catch(() => {});
  } else {
    run();
  }
}

/** Keep urgent alert repeating until panel is opened */
export function startUrgentAlertLoop() {
  if (typeof window === "undefined") return;
  if (looping) {
    playOrderAlertSound();
    return;
  }
  looping = true;
  playOrderAlertSound();
  loopTimer = setInterval(() => {
    playOrderAlertSound();
  }, LOOP_MS);
}

export function stopUrgentAlertLoop() {
  looping = false;
  if (loopTimer) {
    clearInterval(loopTimer);
    loopTimer = null;
  }
}

export function isUrgentAlertLooping() {
  return looping;
}

export function bindOrderAlertUnlock() {
  if (typeof window === "undefined") return () => {};
  const unlock = () => unlockOrderAlertSound();
  window.addEventListener("pointerdown", unlock, { passive: true });
  window.addEventListener("keydown", unlock, { passive: true });
  if (isOrderAlertUnlocked()) unlockOrderAlertSound();
  return () => {
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };
}
