// Behaviour for the rendered markup. Framework-free; runs in any browser.
//
//   mountDeck(root)        root = the .zw-root element from renderDeck
//   mountPromotions(root)  root = the .zw-root element from renderPromotions
//
// Both return an unmount function. Everything keys off data-* hooks the
// renderer emits, and every colour written here is read from the theme's
// custom properties, never typed in.

const q = (root, sel) => root.querySelector(sel);
const qa = (root, sel) => Array.from(root.querySelectorAll(sel));

function colors(root) {
  const cs = getComputedStyle(root);
  const v = (name) => cs.getPropertyValue(name).trim();
  return {
    accent: v("--zw-accent"),
    ink: v("--zw-ink"),
    muted: v("--zw-muted"),
    grey: v("--zw-grey"),
    dot: `rgb(${v("--zw-muted-rgb")} / .35)`,
    learnBorder: `rgb(${v("--zw-ink-rgb")} / .12)`,
    learnGlow: `rgb(${v("--zw-accent-rgb")} / .14)`,
  };
}

function animateCount(el) {
  const target = parseFloat(el.dataset.count || "0");
  const dec = parseInt(el.dataset.dec || "0");
  const dur = 1500;
  const t0 = performance.now();
  const fmt = (v) => v.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  const step = (now) => {
    let p = Math.min(1, (now - t0) / dur);
    p = 1 - Math.pow(1 - p, 3);
    el.textContent = fmt(target * p);
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = fmt(target);
  };
  requestAnimationFrame(step);
}

function revealSection(sec, seen) {
  if (!sec) return;
  const id = sec.dataset.idx || "";
  if (seen.has(id)) return;
  seen.add(id);
  qa(sec, "[data-reveal]").forEach((el, i) => {
    el.style.transitionDelay = i * 65 + "ms";
    el.style.opacity = "1";
    el.style.transform = "none";
  });
  if (sec.dataset.count === "1") qa(sec, "[data-count]").forEach(animateCount);
}

function showModal(root, name) {
  qa(root, "[data-modal]").forEach((m) => { m.style.display = m.dataset.modal === name ? "block" : "none"; });
}
function hideModals(root) {
  qa(root, "[data-modal]").forEach((m) => (m.style.display = "none"));
}
function anyModalOpen(root) {
  return qa(root, "[data-modal]").some((m) => m.style.display && m.style.display !== "none");
}

// Hover effects (stripe sweep + card lift, book-image zoom). Kept in JS on the
// deck because the reveal step writes an inline transform, which would beat a
// CSS :hover rule.
function wireHover(root) {
  const off = [];
  const on = (el, ev, fn) => { el.addEventListener(ev, fn); off.push(() => el.removeEventListener(ev, fn)); };
  qa(root, "[data-card]").forEach((card) => {
    on(card, "mouseenter", () => {
      const s = q(card, "[data-stripe]"); if (s) s.style.transform = "scaleX(1)";
      const g = q(card, "[data-glow]"); if (g) g.style.opacity = "1";
      card.style.transform = "translateY(-6px)";
    });
    on(card, "mouseleave", () => {
      const s = q(card, "[data-stripe]"); if (s) s.style.transform = "scaleX(0)";
      const g = q(card, "[data-glow]"); if (g) g.style.opacity = "0";
      card.style.transform = "none";
    });
  });
  qa(root, "[data-bookimg]").forEach((img) => {
    on(img, "mouseenter", () => (img.style.transform = "scale(1.06)"));
    on(img, "mouseleave", () => (img.style.transform = "scale(1)"));
  });
  return () => off.forEach((f) => f());
}

/** Shared click handling: open a link, open/close a modal. Returns true if handled. */
function commonAction(root, t) {
  switch (t.dataset.act) {
    case "open": if (t.dataset.href) window.open(t.dataset.href, "_blank"); return true;
    case "modal": showModal(root, t.dataset.modalName || ""); return true;
    case "closeModal": hideModals(root); return true;
  }
  return false;
}

/** Full presentation deck. */
export function mountDeck(root, opts = {}) {
  const col = colors(root);
  const main = q(root, "#zw-main");
  const secs = main ? qa(main, "[data-idx]") : [];
  const total = secs.length;
  const labels = qa(root, "[data-dot]").map((d) => d.getAttribute("aria-label") || "");
  const offerIdx = parseInt(root.dataset.zwOffer ?? "-1");
  const storeKey = "zw-active:" + (root.dataset.zwDeck || "deck");
  const seen = new Set();
  let active = 0;

  const scrollTo = (i) => { const s = main && q(main, `[data-idx="${i}"]`); if (main && s) main.scrollTo({ top: s.offsetTop, behavior: "smooth" }); };
  const scrollToInstant = (i) => { const s = main && q(main, `[data-idx="${i}"]`); if (main && s) main.scrollTo({ top: s.offsetTop }); };

  const applyActiveDot = () => {
    qa(root, "[data-dot]").forEach((d) => {
      const on = parseInt(d.dataset.dot || "-1") === active;
      d.style.background = on ? col.accent : col.dot;
      d.style.transform = on ? "scale(1.55)" : "scale(1)";
    });
    const c = q(root, "#zw-counter");
    if (c) c.textContent = `${active + 1} / ${total}  ·  ${labels[active] || ""}`;
    const chip = q(root, "#zw-qr-chip");
    if (chip) chip.style.display = active === offerIdx ? "none" : "flex";
  };

  // learn auto-rotate
  const learnRows = qa(root, "[data-learn-row]");
  let learnActive = 0;
  let learnTimer = null;
  const applyLearn = () => {
    learnRows.forEach((r) => {
      const on = parseInt(r.dataset.learnRow || "-1") === learnActive;
      r.style.borderColor = on ? col.accent : col.learnBorder;
      r.style.background = on ? "#FFFFFF" : "rgba(255,255,255,.45)";
      r.style.boxShadow = on ? `0 14px 40px ${col.learnGlow}` : "none";
      const num = q(r, "[data-learn-num]"); if (num) num.style.color = on ? col.accent : col.grey;
      const bar = q(r, "[data-learn-bar]"); if (bar) bar.style.transform = on ? "scaleY(1)" : "scaleY(0)";
    });
  };
  const startLearn = () => {
    if (learnTimer || !learnRows.length) return;
    learnTimer = setInterval(() => { learnActive = (learnActive + 1) % learnRows.length; applyLearn(); }, 2100);
  };
  const stopLearn = () => { if (learnTimer) { clearInterval(learnTimer); learnTimer = null; } };

  // build auto-check
  const buildRows = qa(root, "[data-build]");
  const buildState = buildRows.map(() => false);
  let buildTimer = null;
  const checkBuild = (i, on) => {
    const el = q(root, `[data-build="${i}"]`);
    if (!el) return;
    const box = q(el, "[data-build-box]");
    const tick = q(el, "[data-build-tick]");
    const title = q(el, "[data-build-title]");
    if (box) { box.style.background = on ? col.accent : "#FFFFFF"; box.style.borderColor = on ? col.accent : col.grey; }
    if (tick) tick.style.opacity = on ? "1" : "0";
    if (title) title.style.color = on ? col.ink : col.muted;
  };
  const toggleBuild = (i) => { buildState[i] = !buildState[i]; checkBuild(i, buildState[i]); };
  const startBuild = () => {
    if (buildTimer || !buildRows.length) return;
    buildTimer = setInterval(() => {
      const n = buildState.findIndex((v) => !v);
      if (n === -1) { stopBuild(); return; }
      buildState[n] = true; checkBuild(n, true);
    }, 1400);
  };
  const stopBuild = () => { if (buildTimer) { clearInterval(buildTimer); buildTimer = null; } };

  const replayIntro = () => {
    const cv = main && q(main, '[data-scene="cover"]');
    if (!cv) return;
    qa(cv, "[data-intro]").forEach((el) => {
      const a = el.dataset.anim;
      if (!a) return;
      el.style.animation = "none";
      void el.offsetWidth;
      el.style.animation = a;
    });
  };

  const sceneOf = (i) => (secs[i] && secs[i].dataset.scene) || "";
  const setActive = (i) => {
    if (i === active) return;
    const prev = active;
    active = i;
    try { localStorage.setItem(storeKey, String(i)); } catch {}
    applyActiveDot();
    if (sceneOf(i) === "learn") startLearn(); else stopLearn();
    if (sceneOf(i) === "build") startBuild(); else stopBuild();
    if (sceneOf(i) === "cover" && sceneOf(prev) !== "cover") replayIntro();
    if (opts.onScene) opts.onScene(i, sceneOf(i));
  };

  const onScroll = () => {
    if (!main) return;
    const c = main.scrollTop + main.clientHeight * 0.42;
    let idx = 0;
    for (let i = 0; i < secs.length; i++) if (secs[i].offsetTop <= c) idx = i;
    revealSection(secs[idx], seen);
    if (secs[idx + 1]) revealSection(secs[idx + 1], seen);
    setActive(idx);
  };

  const onClick = (e) => {
    const t = e.target.closest("[data-act]");
    if (!t) return;
    const idx = parseInt(t.dataset.go || "0");
    switch (t.dataset.act) {
      case "goto": scrollTo(idx); break;
      case "next": scrollTo(Math.min(total - 1, active + 1)); break;
      case "prev": scrollTo(Math.max(0, active - 1)); break;
      case "build": toggleBuild(idx); break;
      default: commonAction(root, t);
    }
  };

  const onKey = (e) => {
    if (e.defaultPrevented || e.target?.closest?.('input, textarea, select, button, a, [contenteditable="true"], [role="slider"], dialog[open]') || document.querySelector("dialog[open]")) return;
    if (anyModalOpen(root)) { if (e.key === "Escape") hideModals(root); return; }
    if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") { e.preventDefault(); scrollTo(Math.min(total - 1, active + 1)); }
    else if (e.key === "ArrowUp" || e.key === "PageUp") { e.preventDefault(); scrollTo(Math.max(0, active - 1)); }
  };

  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => { if (en.isIntersecting) revealSection(en.target, seen); }),
    { root: main, threshold: 0.1 }
  );
  secs.forEach((s) => io.observe(s));
  main && main.addEventListener("scroll", onScroll, { passive: true });
  revealSection(secs[0], seen);

  let saved = 0;
  try { saved = parseInt(localStorage.getItem(storeKey) || "0") || 0; } catch {}
  if (saved > 0 && saved < total) {
    active = saved;
    requestAnimationFrame(() => { scrollToInstant(saved); revealSection(secs[saved], seen); });
  } else saved = 0;
  setTimeout(() => {
    applyActiveDot();
    applyLearn();
    if (sceneOf(saved) === "build") startBuild();
    if (sceneOf(saved) === "learn") startLearn();
  }, 60);

  root.addEventListener("click", onClick);
  window.addEventListener("keydown", onKey);
  const offHover = wireHover(root);

  return () => {
    io.disconnect();
    main && main.removeEventListener("scroll", onScroll);
    root.removeEventListener("click", onClick);
    window.removeEventListener("keydown", onKey);
    offHover();
    stopLearn();
    stopBuild();
  };
}

/** The promotions page: actions, modals, Escape, and the hero parallax. */
export function mountPromotions(root) {
  const onClick = (e) => {
    const t = e.target.closest("[data-act]");
    if (t) commonAction(root, t);
  };
  const onKey = (e) => { if (e.key === "Escape") hideModals(root); };
  root.addEventListener("click", onClick);
  window.addEventListener("keydown", onKey);

  // Scroll-driven parallax: drift the (oversized) image layer as the hero passes
  // through the viewport. The layer is 136% tall, so translating within ±18% of
  // the frame height never exposes an edge.
  const frame = q(root, "[data-zw-hero]");
  const layer = q(root, "[data-zw-parallax]");
  let raf = 0;
  const update = () => {
    raf = 0;
    if (!frame || !layer) return;
    const rect = frame.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const total = rect.height + vh;
    const progress = Math.min(1, Math.max(0, (vh - rect.top) / total));
    const slack = frame.offsetHeight * 0.18;
    const translate = (progress - 0.5) * 2 * slack;
    layer.style.transform = `translate3d(0, ${translate.toFixed(1)}px, 0)`;
  };
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  return () => {
    root.removeEventListener("click", onClick);
    window.removeEventListener("keydown", onKey);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    if (raf) cancelAnimationFrame(raf);
  };
}
