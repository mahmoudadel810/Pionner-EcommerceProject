import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const STORAGE_KEY = "scroll-positions";
const RESTORE_TIMEOUT = 2500;

const readPositions = () => {
  try {
    return new Map(JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || []);
  } catch {
    return new Map();
  }
};

const positions = readPositions();

const scrollToHash = (hash) => {
  const target = document.getElementById(decodeURIComponent(hash.slice(1)));
  if (!target) return false;
  target.scrollIntoView();
  return true;
};

// Starts every new page at the top (or at its #hash) and puts Back/Forward
// where the visitor left that page, waiting for lazy content to make it tall enough.
const ScrollManager = () => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const previous = useRef(null);
  const currentKey = useRef(location.key);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const save = () => positions.set(currentKey.current, window.scrollY);
    const persist = () => {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...positions].slice(-50)));
      } catch {
        // Positions are a convenience; private mode may refuse storage.
      }
    };

    window.addEventListener("scroll", save, { passive: true });
    window.addEventListener("pagehide", persist);
    return () => {
      window.removeEventListener("scroll", save);
      window.removeEventListener("pagehide", persist);
    };
  }, []);

  useLayoutEffect(() => {
    const prev = previous.current;
    previous.current = location;
    currentKey.current = location.key;

    if (navigationType === "POP") {
      const target = positions.get(location.key) ?? 0;
      const started = performance.now();
      let frame = 0;
      let cancelled = false;
      const stop = () => {
        cancelled = true;
      };
      const restore = () => {
        if (cancelled) return;
        window.scrollTo(0, target);
        if (Math.abs(window.scrollY - target) > 1 && performance.now() - started < RESTORE_TIMEOUT) {
          frame = requestAnimationFrame(restore);
        }
      };
      restore();
      window.addEventListener("wheel", stop, { passive: true, once: true });
      window.addEventListener("touchstart", stop, { passive: true, once: true });
      window.addEventListener("keydown", stop, { once: true });
      return () => {
        cancelAnimationFrame(frame);
        window.removeEventListener("wheel", stop);
        window.removeEventListener("touchstart", stop);
        window.removeEventListener("keydown", stop);
      };
    }

    const pathChanged = !prev || prev.pathname !== location.pathname;
    const searchChanged = prev && prev.search !== location.search;
    const hashChanged = prev && prev.hash !== location.hash;

    if (location.hash && (pathChanged || hashChanged)) {
      if (scrollToHash(location.hash)) return;
      const timer = setInterval(() => {
        if (scrollToHash(location.hash)) clearInterval(timer);
      }, 100);
      const giveUp = setTimeout(() => clearInterval(timer), RESTORE_TIMEOUT);
      return () => {
        clearInterval(timer);
        clearTimeout(giveUp);
      };
    }

    // Filter and sort changes replace the URL in place and keep the visitor where they are.
    if (pathChanged || (navigationType === "PUSH" && searchChanged)) {
      window.scrollTo(0, 0);
    }
  }, [location, navigationType]);

  return null;
};

export default ScrollManager;
