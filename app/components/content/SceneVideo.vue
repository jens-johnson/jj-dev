<script setup lang="ts">
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
 * ████████████████████████████████████████ #components/content/SceneVideo.vue █████████████████████████████████████████
 *
 * A full-bleed scrollytelling scene: a muted, looping background video (cover-cropped) drifts on scroll parallax
 * behind an offset column of slotted text, dimmed by a theme-coloured scrim so the prose stays legible. Used as an
 * MDC block in essay posts to paint vivid imagery for a passage. Video plays only while in view; parallax and
 * autoplay both yield to prefers-reduced-motion (the frame holds still).
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * ::scene-video{src="/videos/blog/<post>/scene.mp4" align="right"}
 * Paragraph of scene prose rendered over the video.
 * ::
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */
/* ─── PROPS ──────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * An interface representing the scene-video props
 * @internal
 * @interface
 */
interface ISceneVideoProps {
  /* The public path to the muted background video (e.g. `/videos/blog/<post>/scene.mp4`) */
  src: string;

  /* Which side the text column sits on; the scrim concentrates behind it so the prose stays readable */
  align?: 'left' | 'right';
}

/**
 * The component props; the video source and the text alignment
 * @internal
 * @constant
 */
const props = withDefaults(defineProps<ISceneVideoProps>(), {
  align: 'left',
});

/* ─── PARALLAX ───────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The scene section root, measured against the viewport to drive the parallax offset
 * @internal
 * @constant
 */
const sceneRef = useTemplateRef<HTMLElement>('sceneRef');

/**
 * The background video element whose transform is nudged on scroll
 * @internal
 * @constant
 */
const videoRef = useTemplateRef<HTMLVideoElement>('videoRef');

/**
 * Whether the scene is currently within (or near) the viewport; gates playback and the scroll loop
 * @internal
 */
let visible = false;

/**
 * The pending requestAnimationFrame handle, used to throttle scroll updates to one per frame
 * @internal
 */
let frame = 0;

/**
 * The IntersectionObserver watching the scene; plays/pauses the video and toggles the parallax loop
 * @internal
 */
let observer: IntersectionObserver | null = null;

/**
 * Recomputes the video's vertical parallax offset from the scene's position relative to the viewport centre
 * @internal
 * @function
 */
function update(): void {
  const el = sceneRef.value;
  const video = videoRef.value;
  if (!el || !video) {
    return;
  }
  const rect = el.getBoundingClientRect();
  const viewport = window.innerHeight;
  const center = rect.top + rect.height / 2;
  const raw = (center - viewport / 2) / (viewport / 2 + rect.height / 2);
  const progress = Math.max(-1, Math.min(1, raw));
  // The video is scaled up, so a +/-9% translate never exposes an edge.
  video.style.transform = `translate3d(0, ${(progress * 9).toFixed(2)}%, 0) scale(1.14)`;
}

/**
 * Schedules a single parallax update on the next animation frame while the scene is visible
 * @internal
 * @function
 */
function onScroll(): void {
  if (frame || !visible) {
    return;
  }
  frame = requestAnimationFrame(() => {
    frame = 0;
    update();
  });
}

onMounted(() => {
  if (!import.meta.client) {
    return;
  }
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const video = videoRef.value;
  if (video) {
    video.muted = true;
  }

  observer = new IntersectionObserver(
    (entries) => {
      visible = entries[0]?.isIntersecting ?? false;
      const v = videoRef.value;
      if (v) {
        if (visible && !reduce) {
          void v.play().catch(() => {});
        } else {
          v.pause();
        }
      }
      if (visible && !reduce) {
        update();
      }
    },
    { rootMargin: '10% 0px' },
  );
  if (sceneRef.value) {
    observer.observe(sceneRef.value);
  }

  if (!reduce) {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }
});

onBeforeUnmount(() => {
  if (!import.meta.client) {
    return;
  }
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('resize', onScroll);
  observer?.disconnect();
  if (frame) {
    cancelAnimationFrame(frame);
  }
});
</script>

<template>
  <section
    ref="sceneRef"
    class="scene"
    :class="`scene--${props.align}`"
  >
    <video
      ref="videoRef"
      class="scene__video"
      :src="props.src"
      muted
      loop
      playsinline
      preload="auto"
      aria-hidden="true"
    />

    <div
      class="scene__scrim"
      aria-hidden="true"
    />

    <div class="scene__text">
      <div class="scene__inner">
        <slot />
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ─── Full-bleed band ────────────────────────────────────────────────────────────────────────────────────────────── */

.scene {
  position: relative;
  width: 100vw;
  margin-inline: calc(50% - 50vw);
  margin-block: 3.5rem;
  display: flex;
  align-items: center;
  min-height: min(88vh, 720px);
  overflow: hidden;
  isolation: isolate;
}

/* ─── Background video ───────────────────────────────────────────────────────────────────────────────────────────── */

.scene__video {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.45;
  transform: scale(1.14);
  will-change: transform;
}

/* ─── Scrim: concentrates the page background behind the text side, fades band into the page top/bottom ───────────── */

.scene__scrim {
  position: absolute;
  inset: 0;
  z-index: 1;
  --scrim-x: 30%;

  background:
    radial-gradient(
      130% 120% at var(--scrim-x) 50%,
      color-mix(in oklch, var(--color-bg) 82%, transparent),
      color-mix(in oklch, var(--color-bg) 34%, transparent) 55%,
      transparent 82%
    ),
    linear-gradient(to bottom, var(--color-bg), transparent 16%, transparent 84%, var(--color-bg));
}

.scene--right .scene__scrim {
  --scrim-x: 70%;
}

/* ─── Offset text column ─────────────────────────────────────────────────────────────────────────────────────────── */

.scene__text {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: var(--container-content);
  margin-inline: auto;
  padding-inline: 1.5rem;
}

.scene__inner {
  max-width: 42rem;
}

.scene--right .scene__inner {
  margin-left: auto;
}

.scene__text :deep(p) {
  margin: 0;

  /* Match the surrounding prose body font (sans-serif) so scenes blend with the other sections. */
  font-family: var(--font-body);
  font-size: var(--text-body-lg);
  line-height: 1.7;
  color: var(--color-ink);
  text-shadow: 0 1px 24px color-mix(in oklch, var(--color-bg) 72%, transparent);
}

.scene__text :deep(em) {
  font-style: italic;
}

/* ─── Reduced motion: hold the frame still (no autoplay, no parallax) ─────────────────────────────────────────────── */

@media (prefers-reduced-motion: reduce) {
  .scene__video {
    transform: scale(1.05);
  }
}
</style>
