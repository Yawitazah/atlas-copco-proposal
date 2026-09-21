// Built from the original ZAH Tip Jar viewer; no payment or private code included.
// Web Animations is missing in some Chrome installations used to review this presentation.
// Keep the Tip Jar keyframes and timing, and use a CSS transition only when the native API is absent.
function sodaPopAnimate(el, keyframes, options = {}){
  if (typeof el.animate === 'function') return el.animate(keyframes, options);
  const first = keyframes[0] || {}, last = keyframes[keyframes.length - 1] || {};
  Object.assign(el.style, first);
  void el.offsetWidth;
  const duration = Number(options.duration) || 0, easing = options.easing || 'ease';
  const properties = Object.keys(last).filter((name) => name === 'transform' || name === 'opacity');
  el.style.transition = properties.map((name) => name + ' ' + duration + 'ms ' + easing).join(', ');
  requestAnimationFrame(() => Object.assign(el.style, last));
  setTimeout(() => { el.style.transition = ''; }, duration + 80);
}
const POP = ['#ff3b30','#ff9f0a','#ffd60a','#34c759','#00c7be','#30d158',
             '#32ade6','#0a84ff','#5e5ce6','#bf5af2','#ff375f','#ff6482',
             '#ffcc00','#7bed9f','#70a1ff','#e84393','#00d2d3','#feca57',
             '#ff6b6b','#48dbfb'];

/** Sparks out of a point on screen. Cleans itself up.
 *  They travel slower than they used to. A spark that is gone in half a second
 *  is only seen by someone already staring at the screen, and the person who
 *  just paid is usually looking at the stream when it fires. */
function popSparks(cx, cy, n = 30){
  const burst = document.createElement('div');
  burst.className = 'pop-burst';
  burst.style.left = cx + 'px';
  burst.style.top  = cy + 'px';
  document.body.appendChild(burst);
  for (let i = 0; i < n; i++){
    const s = document.createElement('i');
    const c = POP[i % POP.length];
    s.style.background = c;
    s.style.boxShadow = `0 0 12px ${c}`;
    burst.appendChild(s);
    const ang  = (Math.PI * 2 * i) / n + Math.random() * 0.35;
    const dist = 110 + Math.random() * 210;
    sodaPopAnimate(s, [
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${Math.cos(ang)*dist}px, ${Math.sin(ang)*dist}px) scale(0)`, opacity: 0 }
    ], { duration: 1100 + Math.random() * 700, easing: 'cubic-bezier(.15,.75,.3,1)', fill: 'forwards' });
  }
  setTimeout(() => burst.remove(), 2000);
}

/**
 * Zah Soda Pop.
 * @param el      the element to flash. Its border and glow cycle the spectrum.
 * @param sparks  fire the burst from its centre too.
 */
function zahSodaPop(el, sparks = true){
  if (el){
    const border0 = el.style.borderColor, shadow0 = el.style.boxShadow;
    /* A pop is the WHOLE thing. The edge cycles, and a wash carries the same
       colour across the face, so the inside pops with the outside. */
    const wash = document.createElement('div');
    wash.className = 'pop-wash';
    el.appendChild(wash);
    let i = 0;
    /* 55ms a colour, not 26. Twenty colours at the old speed was over in half a
       second, which is quick enough to miss entirely by glancing away. */
    const id = setInterval(() => {
      const c = POP[i];
      el.style.borderColor = c;
      el.style.boxShadow = `0 0 30px ${c}`;
      wash.style.background = c;
      if (++i >= POP.length){
        clearInterval(id);
        el.style.borderColor = border0;   // back to whatever it was
        el.style.boxShadow = shadow0;
        wash.remove();
      }
    }, 55);
    if (sparks){
      const r = el.getBoundingClientRect();
      popSparks(r.left + r.width / 2, r.top + r.height / 2);
    }
  } else {
    popSparks(innerWidth / 2, innerHeight * 0.42);
  }
}


export {zahSodaPop};
