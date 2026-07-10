/**
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 *
 *                                ██        ██                     ▄▄
 *                                ▀▀        ▀▀                     ██
 *                              ████      ████                ▄███▄██   ▄████▄   ██▄  ▄██
 *                                ██        ██               ██▀  ▀██  ██▄▄▄▄██   ██  ██
 *                                ██        ██      █████    ██    ██  ██▀▀▀▀▀▀   ▀█▄▄█▀
 *                                ██        ██               ▀██▄▄███  ▀██▄▄▄▄█    ████
 *                                ██        ██                 ▀▀▀ ▀▀    ▀▀▀▀▀      ▀▀
 *                             ████▀     ████▀
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 * █████████████████████████████████████ #composables/use-card-tilt/composable.ts ██████████████████████████████████████
 *
 * Mouse-driven 3D tilt + shimmer effect for bento/card elements. Reads the card rect directly from e.currentTarget on
 * each mousemove (no template-ref binding required), which makes it reliable across component boundaries.
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

import type { CSSProperties } from 'vue';

import type { ICardTiltOptions, IUseCardTiltReturn } from './types';

/**
 * A composable providing a mouse-driven 3D tilt and radial-shine effect for card elements
 * @public
 * @default
 * @function
 * @param options - The tilt configuration (intensity, scale, shine opacity)
 * @returns The reactive tilt/shine styles plus the mouse event handlers to bind on the card element
 */
export function useCardTilt(options: ICardTiltOptions = {}): IUseCardTiltReturn {
  /* ─── Setup ────────────────────────────────────────────────────────────────────────────────────────────────────── */

  // Extract the intensity, scale, and shine opacity from options with defaults
  const { intensity = 10, scale = 1.025, shineOpacity = 0.12 }: ICardTiltOptions = options;

  /* ─── State ────────────────────────────────────────────────────────────────────────────────────────────────────── */

  /**
   * The X-axis rotation value for the card
   * @internal
   * @constant
   */
  const rotateX: Ref<number> = ref(0);

  /**
   * The Y-axis rotation value for the card
   * @internal
   * @constant
   */
  const rotateY: Ref<number> = ref(0);

  /**
   * The X-axis glow factor for the card
   * @internal
   * @constant
   */
  const glowX: Ref<number> = ref(50);

  /**
   * The Y-axis glow factor for the card
   * @internal
   * @constant
   */
  const glowY: Ref<number> = ref(50);

  /**
   * A flag indicating if the card is active (hovered(
   * @internal
   * @constant
   */
  const active: Ref<boolean> = ref(false);

  /* ─── Methods ──────────────────────────────────────────────────────────────────────────────────────────────────── */

  /**
   * A utility method to handle mouse move events for the card; calculates rotation/shimmer based on mouse position
   * @internal
   * @function
   * @param e - The triggering [mouse event]{@link MouseEvent}
   */
  function onMouseMove(e: MouseEvent): void {
    // Extract the event target/bounding rect
    const target: HTMLElement = e.currentTarget as HTMLElement;
    const rect: DOMRect = target.getBoundingClientRect();

    // Normalize the cursor position to the [-1, +1] range relative to the card center
    const nx: number = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny: number = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    rotateX.value = -ny * intensity;
    rotateY.value = nx * intensity;

    // Calculate the raw percentage for the radial shine origin
    glowX.value = ((e.clientX - rect.left) / rect.width) * 100;
    glowY.value = ((e.clientY - rect.top) / rect.height) * 100;
  }

  /**
   * A utility method to handle mouse entry events for the card (sets the card active)
   * @internal
   * @function
   */
  function onMouseEnter(): void {
    active.value = true;
  }

  /**
   * A utility method to handle mouse leave events for the card (sets the card inactive and resets rotation)
   * @internal
   * @function
   */
  function onMouseLeave(): void {
    active.value = false;
    rotateX.value = 0;
    rotateY.value = 0;
  }

  /* ─── Computed ─────────────────────────────────────────────────────────────────────────────────────────────────── */

  /**
   * A computed property for the style attributes of the card based on tilt
   * @internal
   * @function
   */
  const tiltStyle: ComputedRef<CSSProperties> = computed((): CSSProperties => {
    const normalizedScale: number = active.value ? scale : 1;
    return {
      transform: `perspective(900px) rotateX(${rotateX.value}deg) rotateY(${rotateY.value}deg) scale3d(${normalizedScale},${normalizedScale},1)`,
      transition: active.value ? 'transform 0.08s linear' : 'transform 0.5s cubic-bezier(0.16,1,0.3,1)',
      willChange: 'transform',
    };
  });

  /**
   * A computed property for the style attributes of the card based on shine
   * @internal
   * @function
   */
  const shineStyle: ComputedRef<CSSProperties> = computed(
    (): CSSProperties => ({
      background: `radial-gradient(circle at ${glowX.value}% ${glowY.value}%, rgba(255,255,255,${shineOpacity}) 0%, transparent 65%)`,
      opacity: active.value ? 1 : 0,
      transition: active.value ? 'opacity 0.15s ease' : 'opacity 0.4s ease',
    }),
  );

  /* ─── Return ───────────────────────────────────────────────────────────────────────────────────────────────────── */

  return {
    tiltStyle,
    shineStyle,
    onMouseMove,
    onMouseEnter,
    onMouseLeave,
  };
}
