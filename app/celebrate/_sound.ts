/**
 * The soundtrack, scheduled rather than triggered.
 *
 * Every note is placed on the AudioContext clock up front, at play time. That
 * costs nothing and buys sample-accurate timing: `requestAnimationFrame` jitter
 * can nudge a frame, but it can never drag the audio out of sync with the
 * count. It is also what makes the video export possible — the same function
 * writes into a `MediaStreamAudioDestinationNode` instead of the speakers.
 */

import { COUNT_MS, INTRO_MS } from "./_timeline";

/** Reused across every burst — allocating noise per pop is pure garbage. */
const noiseCache = new WeakMap<BaseAudioContext, AudioBuffer>();

function noise(ctx: BaseAudioContext) {
  const cached = noiseCache.get(ctx);
  if (cached) return cached;

  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.4), ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;

  noiseCache.set(ctx, buffer);
  return buffer;
}

/**
 * `exponentialRampToValueAtTime` cannot touch zero, so every envelope starts and
 * ends at this instead. Exponential is worth the bother: a linear fade on a
 * decaying note is audible as a shelf right before silence.
 */
const SILENT = 0.0001;

function envelope(gain: GainNode, at: number, peak: number, attack: number, decay: number) {
  gain.gain.setValueAtTime(SILENT, at);
  gain.gain.exponentialRampToValueAtTime(peak, at + attack);
  gain.gain.exponentialRampToValueAtTime(SILENT, at + decay);
}

function tone(
  ctx: BaseAudioContext,
  out: AudioNode,
  at: number,
  frequency: number,
  peak: number,
  decay: number,
  type: OscillatorType = "sine",
  attack = 0.012,
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, at);
  envelope(gain, at, peak, attack, decay);

  osc.connect(gain).connect(out);
  osc.start(at);
  osc.stop(at + decay + 0.05);
}

/**
 * One tick of the counter. Pitch climbs with progress so the run reads as a
 * single rising gesture instead of forty identical clicks.
 */
function tick(ctx: BaseAudioContext, out: AudioNode, at: number, progress: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  filter.type = "bandpass";
  filter.frequency.setValueAtTime(1400 + progress * 900, at);
  filter.Q.setValueAtTime(1.1, at);

  osc.type = "square";
  osc.frequency.setValueAtTime(520 + progress * 660, at);

  envelope(gain, at, 0.035, 0.004, 0.035);

  osc.connect(gain).connect(filter).connect(out);
  osc.start(at);
  osc.stop(at + 0.09);
}

/**
 * Ticks are spaced by how fast the number is actually moving, not by a fixed
 * interval: dense while it spins, opening out as it decelerates, with a short
 * held breath before it lands. Density goes as `sqrt(1 - p)`, which is gentle
 * enough that the run never falls silent mid-count the way a linear mapping of
 * the count's own velocity would.
 */
function scheduleTicks(ctx: BaseAudioContext, out: AudioNode, start: number) {
  const TICKS = 40;
  const budget = (2 / 3) / TICKS;
  const step = 0.002;

  let accumulated = budget;

  for (let p = 0; p < 1; p += step) {
    accumulated += Math.sqrt(1 - p) * step;

    if (accumulated < budget) continue;

    accumulated -= budget;
    tick(ctx, out, start + (INTRO_MS + p * COUNT_MS) / 1000, p);
  }
}

/**
 * The landing: a cork pop, a chord under it for body, and a shimmer that keeps
 * ringing after the visual burst has peaked, so the moment decays instead of
 * stopping. Fires on the same frame as the confetti — a celebration whose sound
 * and picture disagree by even 60ms reads as broken rather than late.
 */
function scheduleBurst(ctx: BaseAudioContext, out: AudioNode, at: number) {
  // Cork pop: filtered noise, short enough to be a transient not a hiss.
  const source = ctx.createBufferSource();
  const popGain = ctx.createGain();
  const popFilter = ctx.createBiquadFilter();

  source.buffer = noise(ctx);
  popFilter.type = "bandpass";
  popFilter.frequency.setValueAtTime(1700, at);
  popFilter.Q.setValueAtTime(0.9, at);
  envelope(popGain, at, 0.22, 0.005, 0.09);

  source.connect(popGain).connect(popFilter).connect(out);
  source.start(at);
  source.stop(at + 0.2);

  // Body: a short pitch drop gives the pop its weight.
  const thump = ctx.createOscillator();
  const thumpGain = ctx.createGain();

  thump.type = "sine";
  thump.frequency.setValueAtTime(150, at);
  thump.frequency.exponentialRampToValueAtTime(48, at + 0.22);
  envelope(thumpGain, at, 0.3, 0.006, 0.3);

  thump.connect(thumpGain).connect(out);
  thump.start(at);
  thump.stop(at + 0.4);

  // A plain major chord — unambiguously "good news", no interpretation needed.
  const chord = ctx.createBiquadFilter();
  chord.type = "lowpass";
  chord.frequency.setValueAtTime(3400, at);
  chord.Q.setValueAtTime(0.5, at);
  chord.connect(out);

  // Decays are long because the ramp is exponential: a note set to fade over
  // 1.9s is already inaudible by 0.9s, which left the confetti falling in
  // silence for the last two seconds. These are sized against the outro, not
  // against the number on the envelope.
  for (const [frequency, delay] of [
    [523.25, 0],
    [659.25, 0.012],
    [783.99, 0.024],
    [1046.5, 0.036],
  ] as const) {
    tone(ctx, chord, at + delay, frequency, 0.075, 3.6, "triangle", 0.014);
  }

  // Shimmer: the tail. Quiet, ascending, and still ringing while the confetti
  // falls, so the celebration ends by fading rather than by stopping.
  const shimmer = [1046.5, 1318.5, 1567.98, 2093, 2637, 3135.96];

  shimmer.forEach((frequency, i) => {
    tone(ctx, out, at + 0.06 + i * 0.07, frequency, 0.03 - i * 0.003, 1.4 + i * 0.2);
  });

  // A pad under everything, barely there, holding the room open until the last
  // ribbon lands. Detuned by a few cents so it breathes instead of sitting flat.
  for (const frequency of [523.25, 783.99, 1046.5]) {
    tone(ctx, chord, at + 0.1, frequency * 1.002, 0.016, 4.6, "sine", 0.35);
  }
}

/**
 * Schedules the whole run. `at` is an AudioContext timestamp; `t0` lets a
 * caller start mid-timeline (a replay from the landing skips the count).
 */
export function scheduleSoundtrack(
  ctx: BaseAudioContext,
  destination: AudioNode,
  at: number,
  land: number,
) {
  const master = ctx.createGain();
  master.gain.value = 0.9;
  master.connect(destination);

  scheduleTicks(ctx, master, at);
  scheduleBurst(ctx, master, at + land / 1000);

  return master;
}
