import { useGSAP } from "@gsap/react";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { PreloaderLetterMark } from "@/src/components/animations/PreloaderLetterMark";
import { LarsonNeedleSvg } from "@/src/components/ui/LarsonNeedleSvg";
import { gsap } from "gsap";
import { prefersReducedMotion } from "@/src/lib/motion";
import { lockPreloaderPending, unlockPreloaderPending } from "@/src/lib/preloader";
import { BRAND } from "@/src/lib/constants";
import { CURTAIN_EASE_CSS } from "@/src/lib/gsap";

const BRAND_TITLE = BRAND.name.toUpperCase();
const BACKGROUND_BEAT_SEC = 0.35;

export interface PreloaderProps {
  mode?: "initial" | "transition";
  onExitStart?: () => void;
  onComplete?: () => void;
}

export function Preloader({
  mode = "initial",
  onExitStart,
  onComplete,
}: PreloaderProps = {}) {
  const [active, setActive] = useState(true);
  const overlayRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const emblemRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const needleStageRef = useRef<HTMLDivElement>(null);
  const needleWrapRef = useRef<HTMLDivElement>(null);
  const letterRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  const titleChars = useMemo(
    () =>
      BRAND_TITLE.split("").map((char, index) => ({
        key: `t-${index}`,
        char: char === " " ? "\u00A0" : char,
      })),
    []
  );

  useLayoutEffect(() => {
    if (prefersReducedMotion()) {
      if (mode === "initial") {
        unlockPreloaderPending();
      }
      document.body.style.overflow = "";
      setActive(false);
      onComplete?.();
      return;
    }

    if (mode === "initial") {
      lockPreloaderPending();
    }
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mode, onComplete]);

  useGSAP(
    () => {
      if (!active) return;

      const overlay = overlayRef.current;
      const stage = stageRef.current;
      const emblem = emblemRef.current;
      const halo = haloRef.current;
      const needleStage = needleStageRef.current;
      const needleWrap = needleWrapRef.current;
      const letter = letterRef.current;
      const copy = copyRef.current;
      const line = lineRef.current;
      const title = titleRef.current;
      const subtitle = subtitleRef.current;

      if (
        !overlay ||
        !stage ||
        !emblem ||
        !halo ||
        !needleStage ||
        !needleWrap ||
        !letter ||
        !copy ||
        !line ||
        !title ||
        !subtitle
      ) {
        return;
      }

      const drawPaths = needleWrap.querySelectorAll<SVGGeometryElement>(
        ".larson-needle__draw"
      );
      const tip = needleWrap.querySelector<SVGCircleElement>(".larson-needle__tip");
      const titleCharEls = title.querySelectorAll<HTMLElement>("[data-preloader-char]");
      const letterLayers = letter.querySelectorAll<HTMLElement>(".preloader-letter__layer");
      const letterFace = letter.querySelector<HTMLElement>(".preloader-letter__face");
      const letterSheen = letter.querySelector<HTMLElement>(".preloader-letter__sheen");

      drawPaths.forEach((path) => {
        const length = path.getTotalLength() || 80;
        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });
      });

      if (tip) {
        gsap.set(tip, {
          opacity: 0,
          scale: 0,
          transformOrigin: "center center",
          transformBox: "fill-box",
        });
      }

      gsap.set(halo, { scale: 0.6, opacity: 0 });
      gsap.set(needleStage, {
        rotateX: 28,
        rotateY: -38,
        z: -80,
        scale: 0.88,
        transformPerspective: 1200,
        transformOrigin: "50% 100%",
      });
      gsap.set(letter, {
        rotateX: 18,
        rotateY: 14,
        z: -40,
        scale: 0.75,
        opacity: 0,
        transformPerspective: 1200,
        transformOrigin: "center center",
      });
      letterLayers.forEach((layer, i) => {
        gsap.set(layer, { opacity: 0, z: -12 + i * 3 });
      });
      if (letterFace) gsap.set(letterFace, { opacity: 0 });
      if (letterSheen) gsap.set(letterSheen, { xPercent: -120, opacity: 0 });

      gsap.set(emblem, {
        transformPerspective: 1200,
        transformStyle: "preserve-3d",
      });
      gsap.set(copy, { opacity: 0, y: 20 });
      gsap.set(line, { scaleX: 0, transformOrigin: "center center" });
      gsap.set(titleCharEls, { opacity: 0, y: 14, rotateX: 40 });
      gsap.set(subtitle, { opacity: 0, y: 8 });
      gsap.set(overlay, { yPercent: 0 });
      gsap.set(stage, { autoAlpha: 0 });

      const finish = () => {
        if (mode === "initial") {
          unlockPreloaderPending();
        }
        document.body.style.overflow = "";
        setActive(false);
        onComplete?.();
      };

      const tl = gsap.timeline({
        onComplete: finish,
        delay: BACKGROUND_BEAT_SEC,
        onStart: () => {
          overlay.classList.add("preloader--animating");
          gsap.set(stage, { autoAlpha: 1 });
        },
      });

      tl.to(
        halo,
        { scale: 1, opacity: 1, duration: 1.1, ease: "power2.out" },
        0
      );

      tl.to(
        needleStage,
        {
          rotateX: 6,
          rotateY: 4,
          z: 24,
          scale: 1,
          duration: 1,
          ease: "power3.out",
        },
        0
      );

      tl.to(
        drawPaths,
        {
          strokeDashoffset: 0,
          duration: 0.95,
          ease: "power2.inOut",
          stagger: 0.04,
        },
        0.08
      );

      if (tip) {
        tl.to(
          tip,
          {
            opacity: 1,
            scale: 1,
            duration: 0.3,
            ease: "back.out(2.8)",
          },
          0.55
        );
      }

      tl.to(
        needleStage,
        {
          rotateY: 8,
          duration: 1.2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: 1,
        },
        0.7
      );

      tl.to(
        letter,
        {
          rotateX: 4,
          rotateY: -6,
          z: 36,
          scale: 1,
          opacity: 1,
          duration: 0.95,
          ease: "power3.out",
        },
        0.45
      );

      tl.to(
        letterLayers,
        {
          opacity: 1,
          duration: 0.5,
          stagger: 0.06,
          ease: "power2.out",
        },
        0.5
      );

      if (letterFace) {
        tl.to(
          letterFace,
          { opacity: 1, duration: 0.55, ease: "power2.out" },
          0.62
        );
      }

      if (letterSheen) {
        tl.to(letterSheen, { opacity: 1, duration: 0.2 }, 0.75);
        tl.to(
          letterSheen,
          { xPercent: 140, duration: 0.85, ease: "power2.inOut" },
          0.75
        );
      }

      tl.to(copy, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, 1.05);

      tl.to(
        line,
        { scaleX: 1, duration: 0.7, ease: "power3.inOut" },
        1.1
      );

      tl.to(
        titleCharEls,
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.55,
          stagger: 0.028,
          ease: "power3.out",
        },
        1.15
      );

      tl.to(
        subtitle,
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
        1.85
      );

      tl.to(
        emblem,
        { rotateY: -3, duration: 0.4, ease: "sine.inOut" },
        2.0
      );

      tl.call(
        () => {
          onExitStart?.();
        },
        [],
        2.35
      );

      tl.to(
        overlay,
        { yPercent: -100, duration: 0.5, ease: "curtain" },
        2.45
      );

      return () => {
        tl.kill();
      };
    },
    { dependencies: [active, mode, onExitStart, onComplete], scope: overlayRef }
  );

  if (!active) return null;

  return (
    <div
      ref={overlayRef}
      className="preloader will-change-transform"
      role="status"
      aria-live="polite"
      aria-label="Loading Larson Fabrics"
    >
      <div className="preloader__bg" aria-hidden />
      <div className="preloader__vignette" aria-hidden />
      <div className="preloader__grain" aria-hidden />
      <div className="preloader__shine" aria-hidden />

      <div ref={stageRef} className="preloader__stage">
        <div ref={emblemRef} className="preloader__emblem">
          <div ref={haloRef} className="preloader__halo" aria-hidden />

          <div ref={needleStageRef} className="preloader__needle-stage">
            <div className="preloader__needle-glow" aria-hidden />
            <div ref={needleWrapRef} className="preloader__needle">
              <LarsonNeedleSvg
                orientation="horizontal"
                size="preloader"
                drawClassName="larson-needle__draw"
              />
            </div>
          </div>

          <PreloaderLetterMark ref={letterRef} />
        </div>

        <div ref={copyRef} className="preloader__copy">
          <span ref={lineRef} className="preloader__rule" aria-hidden />
          <p
            ref={titleRef}
            className="preloader__title font-body font-medium uppercase text-gold"
            aria-label={BRAND_TITLE}
          >
            <span aria-hidden className="preloader__title-inner">
              {titleChars.map(({ key, char }) => (
                <span key={key} data-preloader-char className="preloader__title-char">
                  {char}
                </span>
              ))}
            </span>
          </p>
          <p ref={subtitleRef} className="preloader__subtitle font-body">
            {BRAND.location}
          </p>
        </div>
      </div>
    </div>
  );
}
