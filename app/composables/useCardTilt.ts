/**
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 *
 *                                ██        ██                     ▄▄
 *                                ██        ██                     ██
 *                              ████      ████                ▄███▄██   ▄████▄   ██▄  ▄██
 *                                ██        ██               ██▀  ▀██  ██▄▄▄▄██   ██  ██
 *                                ██        ██      █████    ██    ██  ██▀▀▀▀▀▀   ▀█▄▄█▀
 *                                ██        ██               ▀██▄▄███  ▀██▄▄▄▄█    ████
 *                                ██        ██                 ▀▀▀ ▀▀    ▀▀▀▀▀      ▀▀
 *                             ████▀     ████▀
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 * ████████████████████████████████████████ #composables/useCardTilt.ts ████████████████████████████████████████████████
 *
 * Mouse-driven 3D tilt + shimmer effect for bento/card elements. Reads the card rect directly
 * from e.currentTarget on each mousemove — no template-ref binding required — which makes it
 * reliable across component boundaries.
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * const { tiltStyle, shineStyle, onMouseMove, onMouseEnter, onMouseLeave } = useCardTilt()
 *
 * <div :style="tiltStyle" @mousemove="onMouseMove" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
 *   <div class="pointer-events-none absolute inset-0 z-10 rounded-[inherit]" :style="shineStyle" />
 *   ...content...
 * </div>
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

export interface CardTiltOptions {
  /** Max rotation in degrees applied symmetrically to X and Y axes. Default: 10 */
  intensity?: number;
  /** Uniform scale factor applied on hover. Default: 1.025 */
  scale?: number;
  /** Peak opacity of the radial shine overlay. Default: 0.12 */
  shineOpacity?: number;
}

export function useCardTilt(options: CardTiltOptions = {}) {
  const { intensity = 10, scale = 1.025, shineOpacity = 0.12 } = options;

  const rotateX = ref(0);
  const rotateY = ref(0);
  const glowX = ref(50);
  const glowY = ref(50);
  const active = ref(false);

  /* ─── Event handlers ─────────────────────────────────────────────────────────────────────────────────────────────── */

  function onMouseMove(e: MouseEvent) {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    // Normalise cursor position to –1…+1 relative to card centre
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    rotateX.value = -ny * intensity;
    rotateY.value = nx * intensity;
    // Raw percentage for the radial shine origin
    glowX.value = ((e.clientX - rect.left) / rect.width) * 100;
    glowY.value = ((e.clientY - rect.top) / rect.height) * 100;
  }

  function onMouseEnter() {
    active.value = true;
  }

  function onMouseLeave() {
    active.value = false;
    rotateX.value = 0;
    rotateY.value = 0;
  }

  /* ─── Computed styles ────────────────────────────────────────────────────────────────────────────────────────────── */

  const tiltStyle = computed(() => {
    const s = active.value ? scale : 1;
    return {
      transform: `perspective(900px) rotateX(${rotateX.value}deg) rotateY(${rotateY.value}deg) scale3d(${s},${s},1)`,
      transition: active.value
        ? 'transform 0.08s linear'
        : 'transform 0.5s cubic-bezier(0.16,1,0.3,1)',
      willChange: 'transform',
    };
  });

  const shineStyle = computed(() => ({
    background: `radial-gradient(circle at ${glowX.value}% ${glowY.value}%, rgba(255,255,255,${shineOpacity}) 0%, transparent 65%)`,
    opacity: active.value ? 1 : 0,
    transition: active.value ? 'opacity 0.15s ease' : 'opacity 0.4s ease',
  }));

  return { tiltStyle, shineStyle, onMouseMove, onMouseEnter, onMouseLeave };
}
