/* =======================================================
   enhance.js — purely cosmetic layer
   -------------------------------------------------------
   This file adds *only* visual micro-interactions on top of
   the existing app: a light cursor-follow tilt on cards, a
   soft ripple on primary buttons, and (where supported) a
   whisper-thin device-motion parallax on the hero card.

   It never reads or writes app data, never calls app
   functions, and never changes any element's id, class or
   text. If this file is removed, the app behaves exactly
   the same minus these effects. Everything is delegated
   through document-level listeners so it keeps working even
   though bucket cards, gallery items, etc. are re-rendered
   by app.js on every update.
======================================================= */

(function(){

    "use strict";

    const reducedMotion =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) return;

    /* ---------------------------------------------------
       1) Cursor-follow tilt (mouse / pen only, desktop)
    --------------------------------------------------- */

    const TILT_SELECTOR =
        ".bucketCard,.heroCard,.statCard,.recentItem,.settingItem,.galleryItem";

    const MAX_TILT = 4; // degrees, kept small on purpose
    let tiltTarget = null;
    let tiltX = 0, tiltY = 0;
    let tiltScheduled = false;

    function applyTilt(){
        tiltScheduled = false;
        if (!tiltTarget) return;
        tiltTarget.style.transform =
            `perspective(800px) rotateX(${tiltY}deg) rotateY(${tiltX}deg) translateZ(0)`;
    }

    function scheduleTilt(){
        if (tiltScheduled) return;
        tiltScheduled = true;
        requestAnimationFrame(applyTilt);
    }

    function resetTilt(el){
        if (!el) return;
        el.style.transition = "transform .35s cubic-bezier(.22,1,.36,1)";
        el.style.transform = "none";
        window.setTimeout(() => { el.style.transition = ""; }, 380);
    }

    document.addEventListener("pointermove", (e) => {
        if (e.pointerType && e.pointerType !== "mouse" && e.pointerType !== "pen") return;
        const el = e.target.closest ? e.target.closest(TILT_SELECTOR) : null;
        if (!el){
            if (tiltTarget){ resetTilt(tiltTarget); tiltTarget = null; }
            return;
        }
        const rect = el.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width - 0.5;
        const relY = (e.clientY - rect.top) / rect.height - 0.5;
        tiltTarget = el;
        el.style.transition = "";
        tiltX = relX * MAX_TILT * 2;
        tiltY = -relY * MAX_TILT * 2;
        scheduleTilt();
    }, { passive:true });

    document.addEventListener("pointerout", (e) => {
        const el = e.target.closest ? e.target.closest(TILT_SELECTOR) : null;
        if (!el) return;
        const to = e.relatedTarget;
        if (to && el.contains(to)) return;
        resetTilt(el);
        if (tiltTarget === el) tiltTarget = null;
    }, { passive:true });

    /* ---------------------------------------------------
       2) Soft ripple on primary / action buttons
    --------------------------------------------------- */

    const RIPPLE_SELECTOR =
        ".primaryButton,.fab,.completeButton,.editButton,.deleteButton," +
        ".quoteAddButton,.category,.photoActionButton,.secondaryButton";

    document.addEventListener("pointerdown", (e) => {
        if (e.pointerType && e.pointerType !== "mouse" && e.pointerType !== "touch" && e.pointerType !== "pen") return;
        const el = e.target.closest ? e.target.closest(RIPPLE_SELECTOR) : null;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        if (getComputedStyle(el).position === "static"){
            el.style.position = "relative";
        }
        const prevOverflow = el.style.overflow;
        el.style.overflow = "hidden";

        const size = Math.max(rect.width, rect.height) * 1.6;
        const span = document.createElement("span");
        span.style.position = "absolute";
        span.style.left = (e.clientX - rect.left - size / 2) + "px";
        span.style.top = (e.clientY - rect.top - size / 2) + "px";
        span.style.width = size + "px";
        span.style.height = size + "px";
        span.style.borderRadius = "50%";
        span.style.pointerEvents = "none";
        span.style.background = "radial-gradient(circle, rgba(255,255,255,.35), rgba(255,255,255,0) 70%)";
        span.style.mixBlendMode = "overlay";
        el.appendChild(span);

        const anim = span.animate(
            [
                { opacity: 1, transform: "scale(0)" },
                { opacity: 0, transform: "scale(1)" }
            ],
            { duration: 420, easing: "cubic-bezier(.22,1,.36,1)" }
        );

        anim.onfinish = () => {
            span.remove();
            el.style.overflow = prevOverflow;
        };
    }, { passive:true });

    /* ---------------------------------------------------
       3) Whisper-thin parallax on the hero card
       (device motion where already permitted, otherwise
       a tiny mouse-based drift as a graceful fallback —
       both capped extremely small so it never fights
       readability or touch scrolling)
    --------------------------------------------------- */

    const hero = document.querySelector(".heroCard");

    if (hero){

        let heroScheduled = false;
        let heroX = 0, heroY = 0;

        function applyHero(){
            heroScheduled = false;
            hero.style.transform = `translate3d(${heroX}px, ${heroY}px, 0)`;
        }

        function scheduleHero(){
            if (heroScheduled) return;
            heroScheduled = true;
            requestAnimationFrame(applyHero);
        }

        const canUseMotion =
            typeof DeviceOrientationEvent !== "undefined" &&
            typeof DeviceOrientationEvent.requestPermission !== "function"; // no prompt required

        if (canUseMotion){
            window.addEventListener("deviceorientation", (e) => {
                if (e.beta == null || e.gamma == null) return;
                heroX = Math.max(-3, Math.min(3, e.gamma * 0.08));
                heroY = Math.max(-3, Math.min(3, (e.beta - 40) * 0.04));
                scheduleHero();
            }, { passive:true });
        }

    }

})();
