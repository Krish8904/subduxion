import { useEffect, useState } from "react";
import Lenis from "lenis";

export default function ChatBot() {
  const [botReady, setBotReady] = useState(false);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const rafId = requestAnimationFrame(raf);

    // ── Block Lenis wheel capture when over the widget ──
    const preventLenis = (e) => {
      const widget = document.getElementById("bp-web-widget-container");
      if (widget && widget.matches(":hover")) {
        e.stopPropagation();
        lenis.stop();
      } else {
        lenis.start();
      }
    };

    // Must be capture:true so it fires BEFORE Lenis sees the event
    window.addEventListener("wheel", preventLenis, { capture: true, passive: false });

    // ── MutationObserver to catch widget mount ──
    const onEnter = () => lenis.stop();
    const onLeave = () => lenis.start();
    let widgetEl = null;

    const observer = new MutationObserver(() => {
      const el = document.getElementById("bp-web-widget-container");
      if (el && el !== widgetEl) {
        widgetEl = el;
        widgetEl.addEventListener("mouseenter", onEnter);
        widgetEl.addEventListener("mouseleave", onLeave);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // ── Load Botpress scripts ──
    ["bp-script1", "bp-script2"].forEach((id) => {
      document.getElementById(id)?.remove();
    });

    const script1 = document.createElement("script");
    script1.id = "bp-script1";
    script1.src = "https://cdn.botpress.cloud/webchat/v3.6/inject.js";
    script1.async = true;
    script1.onload = () => {
      const script2 = document.createElement("script");
      script2.id = "bp-script2";
      script2.src = "https://files.bpcontent.cloud/2026/03/16/05/20260316054017-N9RVPEKI.js";
      script2.async = true;
      script2.onload = () => setTimeout(() => setBotReady(true), 600);
      document.body.appendChild(script2);
    };
    document.body.appendChild(script1);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      window.removeEventListener("wheel", preventLenis, { capture: true });
      observer.disconnect();
      if (widgetEl) {
        widgetEl.removeEventListener("mouseenter", onEnter);
        widgetEl.removeEventListener("mouseleave", onLeave);
      }
      window.botpress?.close();
      window.botpress?.hide?.();
      ["bp-script1", "bp-script2"].forEach((id) => {
        document.getElementById(id)?.remove();
      });
      document
        .querySelectorAll("[id^='bp-'], [class^='bp-'], #botpress-webchat, #bp-web-widget-container")
        .forEach((el) => el.remove());
    };
  }, []);

  return <></>;
}
