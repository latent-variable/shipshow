      // kit/kit.js: the timeline every video shares. A video's own <script> in scenes.html runs
      // after this and may add to `tl`; each element's cue time is its data-at attribute (seconds).
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
      tl.to({}, { duration: TOTAL }, 0);

      // Sound effects are placed by bin/sfx.mjs from the text of scenes.html at build time (and from
      // each element's data-sfx), never by this page; these exist so a script that places one still
      // runs here. cueAt is an element's data-at, sceneStart and sceneEnd a scene's edges.
      const cueAt = (sel) => +document.querySelector(sel).dataset.at;
      const sceneEl = (id) => document.querySelector('[data-scene="' + id + '"]');
      const sceneSpan = (el) => [+(el.dataset.start ?? el.dataset.sceneStart), +(el.dataset.duration ?? el.dataset.sceneDuration)];   // a scene with a video keeps them in data-scene-*
      const sceneStart = (id) => sceneSpan(sceneEl(id))[0];
      const sceneEnd = (id) => sceneStart(id) + sceneSpan(sceneEl(id))[1];
      const sfx = () => {};

      // The motion settings are theme tokens (themes/<name>/theme.css), which a video's
      // video.json "flair" may override; a section's data-transition or data-camera wins.
      const STYLE = getComputedStyle(document.getElementById("root"));
      const token = (name, fallback) => STYLE.getPropertyValue(name).trim().replace(/^["']|["']$/g, "") || fallback;

      // Seeded, so a video renders the same frames every time (never Math.random), and each
      // video's background moves its own way (SEED comes from its name, or video.json "seed").
      let seedState = SEED >>> 0;
      const rand = () => {
        seedState = (seedState + 0x6d2b79f5) >>> 0;
        let t = seedState;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };

      // A hash of a step and a lane, for motion that jumps (grain): the same frame always gets the same
      // value, whatever was rendered before it.
      const timeHash = (step, lane, seed = SEED) => {
        let h = Math.imul((step + 1) ^ seed, 2654435761) ^ Math.imul(lane + 0x9e37, 40503);
        h = Math.imul(h ^ (h >>> 15), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
      };
      const TAU = Math.PI * 2, toPx = (v) => `${v.toFixed(1)}px`;
      // Motion as a function of time rather than a tween between two values (a sway, a wrap, a jump):
      // one linear tween of each property from 0 to TOTAL on the timeline, mapped through its function
      // by a modifier, so seeking to any time draws that time's frame and no callback is involved.
      const driveBy = (el, fns) => {
        const from = {}, to = { duration: TOTAL, ease: "none", modifiers: {}, immediateRender: false };
        Object.entries(fns).forEach(([k, f]) => { from[k] = 0; to[k] = TOTAL; to.modifiers[k] = (v) => f(parseFloat(v)); });
        // A timeline sought to 0 on a fresh page does not render, so time 0 is drawn here.
        gsap.set(el, Object.fromEntries(Object.entries(fns).map(([k, f]) => [k, f(0)])));
        tl.fromTo(el, from, to, 0);
      };
      const buildAmbient = (ambientEl, ambientName, ambientSeed = SEED, overlayHost = null, ambientTokens = {}) => {
      seedState = ambientSeed >>> 0;
      const SEED = ambientSeed;
      const stepHash = (step, lane) => timeHash(step, lane, ambientSeed);
      const ambientStyle = getComputedStyle(ambientEl);
      const token = (name, fallback) => (ambientTokens[name] || ambientStyle.getPropertyValue(name)).trim().replace(/^["']|["']$/g, "") || fallback;
      // Layers that lie over the scenes (grain, scanlines, vignette) go in #overlay, made only when a
      // theme asks for one: after the scenes, before the captions.
      let overlayEl = null;
      const makeOverlay = () => {
        if (overlayEl) return;
        overlayEl = document.createElement("div");
        overlayEl.id = overlayHost ? "" : "overlay";
        if (overlayHost) { overlayHost.appendChild(overlayEl); return; }
        document.getElementById("root").insertBefore(overlayEl, document.querySelector(".caps"));
      };

      // Ambient background: a slow drift under every scene; several may layer ("stars glow").
      ambientName.split(/\s+/).forEach((ambient) => {
      if (ambient === "stars") {
        // Three layers of seeded stars, the nearer ones bigger and faster: parallax.
        [[90, 1.4, 60], [45, 2.2, 140], [18, 3.2, 260]].forEach(([count, size, drift]) => {
          const layer = document.createElement("div");
          layer.className = "stars";
          for (let i = 0; i < count; i++) {
            const star = document.createElement("div");
            star.className = "star";
            const s = size * (0.6 + rand() * 0.8);
            Object.assign(star.style, { left: `${(rand() * 100).toFixed(2)}%`, top: `${(rand() * 100).toFixed(2)}%`, width: `${s.toFixed(1)}px`, height: `${s.toFixed(1)}px`, opacity: (0.25 + rand() * 0.6).toFixed(2) });
            layer.appendChild(star);
          }
          ambientEl.appendChild(layer);
          tl.fromTo(layer, { x: 0 }, { x: -Math.round(drift * (TOTAL / 60)), duration: TOTAL, ease: "none" }, 0);
        });
      } else if (ambient === "glow") {
        // Two glows, kept apart, so the theme's colours never blur into grey where they meet.
        ["--accent", "--accent-2"].forEach((colour, i) => {
          const blob = document.createElement("div");
          blob.className = "blob";
          blob.style.background = `var(${colour})`;
          blob.style.left = `${Math.round(i * 45 + rand() * 25)}%`;
          blob.style.top = `${Math.round(rand() * 55)}%`;
          ambientEl.appendChild(blob);
          tl.to(blob, { x: Math.round((rand() - 0.5) * 700), y: Math.round((rand() - 0.5) * 420), duration: TOTAL, ease: "sine.inOut" }, 0);
        });
      } else if (ambient === "grid" || ambient === "dots") {
        const layer = document.createElement("div");
        layer.className = ambient;
        ambientEl.appendChild(layer);
        tl.fromTo(layer, { x: 0, y: 0 }, { x: -Math.round(60 + rand() * 120), y: -Math.round(30 + rand() * 80), duration: TOTAL, ease: "none" }, 0);
      } else if (ambient === "horizon") {
        // A planet's rim low in the frame: a gridded arc lit along its edge, rising slowly.
        const planet = document.createElement("div");
        planet.className = "horizon";
        planet.setAttribute("data-layout-allow-overflow", "");
        ambientEl.appendChild(planet);
        tl.fromTo(planet, { y: 60 }, { y: -40, duration: TOTAL, ease: "sine.inOut" }, 0);
      } else if (ambient === "blobs") {
        // Soft pools of light that drift and breathe: radial gradients, never a blur filter, so they cost
        // nothing to draw. Colours from --blob-1..3 (the accents when unset).
        [["--blob-1", "--accent"], ["--blob-2", "--accent-2"], ["--blob-3", "--accent-3"]].forEach(([name, fallback], i) => {
          const blob = document.createElement("div");
          blob.className = "pool";
          blob.setAttribute("data-layout-allow-overflow", "");
          blob.style.background = `radial-gradient(closest-side, var(${name}, var(${fallback})), transparent)`;
          blob.style.left = `${Math.round(i * 30 + rand() * 20)}%`;
          blob.style.top = `${Math.round(10 + rand() * 50)}%`;
          ambientEl.appendChild(blob);
          const ax = 220 + rand() * 260, ay = 120 + rand() * 160, px = 50 + rand() * 50, py = 40 + rand() * 40, fx = rand() * TAU, fy = rand() * TAU;
          const breathe = (t) => 1 + 0.14 * Math.sin(TAU * t / (py * 0.7) + fx);
          driveBy(blob, { x: (t) => toPx(ax * Math.sin(TAU * t / px + fx)), y: (t) => toPx(ay * Math.sin(TAU * t / py + fy)), scaleX: breathe, scaleY: breathe });
        });
      } else if (ambient === "dust") {
        // Motes in lamplight, rising and swaying, the nearer ones bigger, brighter and faster; each
        // wraps round to the bottom when it leaves the top. Colour --dust-color (--ink when unset).
        const H = 1080 * 1.24;   // #ambient's height (inset -12%)
        [[30, 3, 8], [14, 6, 14], [6, 16, 22]].forEach(([count, size, speed]) => {
          for (let i = 0; i < count; i++) {
            const mote = document.createElement("div");
            mote.className = "mote";
            mote.setAttribute("data-layout-allow-overflow", "");
            const s = size * (0.7 + rand() * 0.6), v = speed * (0.7 + rand() * 0.6), y0 = rand() * H;
            const sway = 8 + rand() * 30, period = 7 + rand() * 9, phase = rand() * TAU, glow = 0.35 + rand() * 0.55;
            Object.assign(mote.style, { left: `${(rand() * 100).toFixed(2)}%`, width: `${s.toFixed(1)}px`, height: `${s.toFixed(1)}px` });
            ambientEl.appendChild(mote);
            driveBy(mote, {
              y: (t) => toPx(-((y0 + v * t) % H)),
              x: (t) => toPx(sway * Math.sin(TAU * t / period + phase)),
              opacity: (t) => (glow * (0.65 + 0.35 * Math.sin(TAU * t / (period * 0.6) + phase * 2))).toFixed(3),
            });
          }
        });
      } else if (ambient === "skyline") {
        // A city at night along the bottom of the frame, as if seen from the desk: two rows of seeded
        // buildings (--skyline-far, --skyline-near) with lit windows (--window-color), drifting apart
        // slowly (parallax), and a few windows going on and off. Drawn once as SVG, then only moved.
        const below = Math.round(1080 * 0.12);   // #ambient reaches this far under the frame
        [["far", 0.35, 100, 240, 70, 170, 0.4], ["near", 0.8, 40, 165, 90, 230, 0.8]].forEach(([row, speed, hMin, hMax, wMin, wMax, lit]) => {
          const width = Math.ceil(1920 * 1.24 + speed * TOTAL + 40), height = hMax + 40 + below;
          let x = -rand() * 60, rects = "", windows = "";
          const flickers = [];
          while (x < width) {
            const w = Math.round(wMin + rand() * (wMax - wMin)), h = Math.round(hMin + rand() * (hMax - hMin)), top = height - below - h;
            rects += `<rect x="${x.toFixed(0)}" y="${top}" width="${w}" height="${h + below}"/>`;
            if (rand() < 0.35) { const cw = Math.round(w * (0.3 + rand() * 0.3)); rects += `<rect x="${(x + (w - cw) / 2).toFixed(0)}" y="${top - 18}" width="${cw}" height="20"/>`; }
            if (rand() < 0.2) rects += `<rect x="${(x + w * (0.2 + rand() * 0.6)).toFixed(0)}" y="${top - 46}" width="3" height="30"/>`;
            // Windows on a grid, a few lit; some of the lit ones keep their own hours.
            for (let wy = top + 16; wy < height - below - 14; wy += 30) {
              for (let wx = x + 12; wx < x + w - 18; wx += 24) {
                if (rand() > 0.16) continue;
                const win = `x="${wx.toFixed(0)}" y="${wy}" width="9" height="13"`;
                if (rand() < 0.12) flickers.push(win); else windows += `<rect ${win}/>`;
              }
            }
            x += w + Math.round(rand() * 14);
          }
          const layer = document.createElement("div");
          layer.className = `skyline ${row}`;
          layer.setAttribute("data-layout-allow-overflow", "");
          layer.innerHTML = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><g class="bldg">${rects}</g><g class="win" opacity="${lit}">${windows}${flickers.map((f, i) => `<rect class="fl" data-i="${i}" ${f}/>`).join("")}</g></svg>`;
          ambientEl.appendChild(layer);
          driveBy(layer, { x: (t) => toPx(-speed * t) });
          // A flickering window changes its state every few seconds, by a hash of the step: on or off.
          layer.querySelectorAll(".fl").forEach((el, i) => {
            const every = 3 + (i % 5) * 1.7, lane = 10 + i + (row === "far" ? 500 : 0);
            driveBy(el, { opacity: (t) => (stepHash(Math.floor(t / every), lane) < 0.55 ? 1 : 0) });
          });
        });
      } else if (ambient === "grain" || ambient === "scanlines" || ambient === "vignette") {
        // Over the scenes and under the captions, so it lies on the pictures like film but never on
        // the words the viewer reads.
        makeOverlay();
        // Decorative and meant to lie over text: HyperFrames' layout check is told so.
        const veil = (el) => { el.setAttribute("data-layout-allow-occlusion", ""); el.setAttribute("data-layout-ignore", ""); overlayEl.appendChild(el); return el; };
        const layer = veil(document.createElement("div"));
        layer.className = ambient;
        if (ambient === "grain") {
          // A seeded noise tile, jumped to a new place --grain-fps times a second: fresh grain each
          // step, drawn once. The jump is a hash of the step, so any frame can be rendered first.
          const tile = 256, fps = parseFloat(token("--grain-fps", "12"));
          const noise = `<svg xmlns='http://www.w3.org/2000/svg' width='${tile}' height='${tile}'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='${SEED % 9973}' stitchTiles='stitch'/><feColorMatrix values='0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 0 0 1'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`;
          layer.style.backgroundImage = `url("data:image/svg+xml,${noise.replace(/</g, "%3C").replace(/>/g, "%3E")}")`;
          layer.style.backgroundSize = `${tile}px ${tile}px`;
          layer.setAttribute("data-layout-allow-overflow", "");
          driveBy(layer, { x: (t) => toPx(-Math.floor(stepHash(Math.floor(t * fps), 1) * tile)), y: (t) => toPx(-Math.floor(stepHash(Math.floor(t * fps), 2) * tile)) });
        } else if (ambient === "scanlines") {
          // Fine lines, and a soft bright band rolling down the screen, like an old set's refresh.
          const band = veil(document.createElement("div"));
          band.className = "roll";
          band.setAttribute("data-layout-allow-overflow", "");
          const period = 9 + rand() * 4, phase = rand();
          driveBy(band, { y: (t) => toPx((((t / period + phase) % 1) * 1.5 - 0.25) * 1080) });
        }
      } else if (ambient !== "none") {
        throw new Error(`unknown --ambient ${ambient}: none, glow, grid, dots, stars, horizon, blobs, dust, skyline, grain, scanlines or vignette`);
      }
      });

      };
      if (typeof MOODS === "undefined") {
        buildAmbient(document.getElementById("ambient"), token("--ambient", "none"));
      } else {
        const root = document.getElementById("root");
        const baseAmbient = token("--ambient", "none");
        root.style.background = "#000";
        root.style.isolation = "isolate";
        const baseTokens = Object.fromEntries(Object.keys(MOODS[0].tokens).map((key) => [key, STYLE.getPropertyValue(key).trim()]));
        const overlay = document.createElement("div");
        overlay.id = "overlay";
        root.insertBefore(overlay, document.querySelector(".caps"));
        const backgrounds = [], ambients = new Map();
        const moodHash = (name) => {
          let h = SEED;
          for (const c of name) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
          return h >>> 0;
        };
        MOODS.forEach((mood, i) => {
          const tokens = { ...baseTokens, ...mood.tokens };
          const sky = document.createElement("div");
          sky.className = "mood-backdrop";
          sky.setAttribute("aria-hidden", "true");
          Object.entries(tokens).forEach(([key, value]) => sky.style.setProperty(key, value || "initial"));
          sky.style.background = "var(--sky, var(--bg))";
          root.insertBefore(sky, document.getElementById("ambient"));
          gsap.set(sky, { opacity: i === 0 ? 1 : 0 });
          backgrounds.push(sky);
          if (i) {
            const at = Math.max(0, mood.start - 0.6), duration = mood.start + 0.6 - at;
            tl.to(backgrounds[i - 1], { opacity: 0, duration, ease: "none" }, at);
            tl.to(sky, { opacity: 1, duration, ease: "none" }, at);
            const previous = MOODS[i - 1].tokens;
            Object.entries(tokens).forEach(([key, value]) => {
              const from = previous[key] || baseTokens[key] || "";
              const plain = (x) => /^[-+]?(?:\d*\.)?\d+$/.test(x);
              const colour = (x) => x && !/var\(|currentColor/i.test(x) && CSS.supports("color", x);
              const tween = !/^--(?:font|display-|cap-)/.test(key) && key !== "--sky" && ((plain(from) && plain(value)) || (colour(from) && colour(value)));
              if (tween) tl.fromTo(root, { [key]: from }, { [key]: value, duration, ease: "none", immediateRender: false }, at);
              else tl.set(root, { [key]: value }, mood.start);
            });
          } else gsap.set(root, tokens);
          // No ambient override means the same base container, with its playhead intact.
          const ambientKey = mood.ambient === undefined ? "base" : `mood:${mood.name}`;
          if (!ambients.has(ambientKey)) {
            const container = document.createElement("div"), over = document.createElement("div");
            container.className = "mood-ambient";
            over.className = "mood-overlay";
            document.getElementById("ambient").appendChild(container);
            overlay.appendChild(over);
            const seed = ambientKey === "base" ? SEED : moodHash(mood.name);
            buildAmbient(container, mood.ambient ?? baseAmbient, seed, over, tokens);
            gsap.set([container, over], { opacity: i === 0 ? 1 : 0 });
            ambients.set(ambientKey, [container, over]);
          }
          mood.ambientKey = ambientKey;
          if (i && ambientKey !== MOODS[i - 1].ambientKey) {
            const at = Math.max(0, mood.start - 0.6), duration = mood.start + 0.6 - at;
            tl.to(ambients.get(MOODS[i - 1].ambientKey), { opacity: 0, duration, ease: "none" }, at);
            tl.to(ambients.get(ambientKey), { opacity: 1, duration, ease: "none" }, at);
          }
        });
      }

      // Progress bar across the top.
      const progress = document.getElementById("progress");
      if (token("--progress", "off") === "on") tl.fromTo(progress, { scaleX: 0 }, { scaleX: 1, duration: TOTAL, ease: "none" }, 0);
      else gsap.set(progress, { display: "none" });

      // Scenes: each exists only inside its own window (a snapshot does not hide a clip by
      // itself), enters with its transition, leaves with a short fade, and the camera drifts.
      const TRANSITIONS = {
        none: null,
        fade: { opacity: 0 },
        rise: { opacity: 0, y: 40 },
        slide: { opacity: 0, x: 140 },
        zoom: { opacity: 0, scale: 0.94 },
        wipe: { clipPath: "inset(0% 100% 0% 0%)" },
        flash: { opacity: 0, scale: 1.06, filter: "brightness(2.4)" },
      };
      const SETTLED = { opacity: 1, x: 0, y: 0, scale: 1, clipPath: "inset(0% 0% 0% 0%)", filter: "brightness(1)" };
      // The last scene is the one that ends last on the timeline, whatever its place in the page.
      const scenes = [...document.querySelectorAll("section.scene")];
      const finalEnd = Math.max(...scenes.map((el) => sceneSpan(el)[0] + sceneSpan(el)[1]));
      scenes.forEach((el) => {
        const inner = el.querySelector(":scope > .inner"), cam = inner.querySelector(":scope > .cam");
        const [start, dur] = sceneSpan(el), end = start + dur, last = end >= finalEnd - 0.001;
        const kind = el.dataset.transition || token("--transition", "fade");
        if (!(kind in TRANSITIONS)) throw new Error(`unknown transition ${kind}: ${Object.keys(TRANSITIONS).join(", ")}`);
        gsap.set(inner, { opacity: 0 });
        tl.set(inner, { opacity: 1 }, start);
        const from = TRANSITIONS[kind];
        if (from) {
          const settled = Object.fromEntries(Object.keys(from).map((k) => [k, SETTLED[k]]));
          tl.fromTo(inner, { ...from }, { ...settled, duration: Math.min(0.55, dur * 0.12), ease: "power3.out", immediateRender: false }, start);
          // fromTo, not to: parallel render workers seek to any time first, so the start is stated.
          // The last scene never fades: the video ends on its finished frame, which is what a
          // paused or ended player shows while people talk about it.
          if (!last) {
            const out = Math.min(0.3, dur * 0.06);
            tl.fromTo(inner, { opacity: 1 }, { opacity: 0, duration: out, ease: "power1.in", immediateRender: false }, end - out);
          }
        }
        if (!last) tl.set(inner, { opacity: 0 }, end);
        if ((el.dataset.camera || token("--camera", "none")) === "push") {
          tl.fromTo(cam, { scale: 1 }, { scale: 1.04, duration: dur, ease: "none", immediateRender: false }, start);
        }
      });

      // Memes (bin/meme.mjs): each line is fitted to its box, the largest size whose wrapped text
      // fits both ways, so a line stays crisp and inside the picture. Layout only, no randomness:
      // the same fonts give the same sizes. Run now and again once the fonts are in.
      const fitMemes = () => {
        const cap = parseFloat(token("--meme-max-font", "0.9"));   // of the box's height, per line of text
        document.querySelectorAll(".ss-meme-box").forEach((box) => {
          const line = box.firstElementChild, h = box.clientHeight, w = box.clientWidth;
          if (!h || !w) return;
          const fits = (px) => { line.style.fontSize = px + "px"; return line.scrollWidth <= line.clientWidth + 0.5 && line.scrollHeight <= h + 0.5; };   // the line is 96% of its box (base.css), so text keeps a margin each side
          let lo = 6, hi = Math.max(8, Math.floor(h * cap * 3));
          while (lo < hi) { const mid = Math.ceil((lo + hi) / 2); if (fits(mid)) lo = mid; else hi = mid - 1; }
          // Too long for its box even at the smallest size: keep it inside the box and say so,
          // so the frames show a clipped line rather than text spilling across the picture.
          if (!fits(lo)) { box.dataset.overflow = "1"; console.warn(`meme line too long for its box: "${line.textContent}"`); }
          else delete box.dataset.overflow;
          line.style.fontSize = lo + "px";
        });
      };
      fitMemes();
      if (document.fonts) document.fonts.ready.then(fitMemes);

      // Each element with a cue arrives when the voice reaches its word. data-anim picks how;
      // without one it gets the theme's --entrance.
      const SIMPLE = {
        up: [{ opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }],
        fade: [{ opacity: 0 }, { opacity: 1, duration: 0.5, ease: "none" }],
        pop: [{ opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.8)" }],
        left: [{ opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }],
        right: [{ opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }],
        grow: [{ scaleX: 0, transformOrigin: "left center" }, { scaleX: 1, duration: 0.7, ease: "power2.inOut" }],
        zoom: [{ opacity: 0, scale: 1.35 }, { opacity: 1, scale: 1, duration: 0.6, ease: "power3.out" }],
        blur: [{ opacity: 0, filter: "blur(14px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.6, ease: "power2.out" }],
      };
      // Split an element's text into one span per character, keeping any markup around it.
      const splitChars = (el) => {
        const chars = [];
        const walk = (node) => {
          [...node.childNodes].forEach((child) => {
            if (child.nodeType === 3) {
              const frag = document.createDocumentFragment();
              [...child.textContent].forEach((ch) => {
                if (/\s/.test(ch)) { frag.appendChild(document.createTextNode(ch)); return; }
                const span = document.createElement("span");
                span.textContent = ch;
                frag.appendChild(span);
                chars.push(span);
              });
              child.replaceWith(frag);
            } else if (child.nodeType === 1) walk(child);
          });
        };
        walk(el);
        return chars;
      };
      const SPECIAL = {
        // Typed out, one character at a time.
        type(el, at) {
          const chars = splitChars(el);
          gsap.set(chars, { opacity: 0 });
          tl.to(chars, { opacity: 1, duration: 0.01, stagger: Math.min(0.05, 1.4 / Math.max(1, chars.length)) }, at);
        },
        // SVG lines draw themselves.
        draw(el, at) {
          const shapes = el.matches("path, line, polyline, polygon, circle, rect, ellipse") ? [el] : [...el.querySelectorAll("path, line, polyline, polygon, circle, rect, ellipse")];
          if (!shapes.length) throw new Error("data-anim=\"draw\" needs an SVG with paths or shapes inside");
          shapes.forEach((shape) => {
            const len = Math.ceil(shape.getTotalLength());
            gsap.set(shape, { strokeDasharray: len, strokeDashoffset: len });
            tl.to(shape, { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut" }, at);
          });
        },
        // A number counts up from zero, keeping its prefix, suffix, commas and decimals.
        count(el, at) {
          const text = el.textContent, m = text.match(/-?[\d,]*\.?\d+/);
          if (!m) throw new Error(`data-anim="count" needs a number in "${text.trim()}"`);
          const target = parseFloat(m[0].replace(/,/g, "")), places = (m[0].split(".")[1] || "").length;
          const before = text.slice(0, m.index), after = text.slice(m.index + m[0].length);
          const show = (v) => before + v.toLocaleString("en-US", { minimumFractionDigits: places, maximumFractionDigits: places, useGrouping: m[0].includes(",") }) + after;
          const state = { v: 0 };
          el.textContent = show(0);
          gsap.set(el, { opacity: 0 });
          tl.to(el, { opacity: 1, duration: 0.2 }, at);
          tl.to(state, { v: target, duration: 1.1, ease: "power2.out", onUpdate: () => { el.textContent = show(state.v); } }, at);
        },
        // A marker sweeps under the words, below the letters so it never muddies them.
        highlight(el, at) {
          gsap.set(el, {
            backgroundImage: "linear-gradient(var(--accent), var(--accent))",
            backgroundRepeat: "no-repeat", backgroundPosition: "0% 100%", backgroundSize: "0% 12%",
          });
          tl.to(el, { backgroundSize: "100% 12%", duration: 0.6, ease: "power2.out" }, at);
        },
        // Each child arrives in turn.
        stagger(el, at) {
          const kids = [...el.children];
          gsap.set(kids, { opacity: 0, y: 24 });
          tl.to(kids, { opacity: 1, y: 0, duration: 0.45, stagger: 0.14, ease: "power2.out" }, at);
        },
        // Pops in, then beats twice to draw the eye.
        pulse(el, at) {
          gsap.set(el, { opacity: 0, scale: 0.6 });
          tl.to(el, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.8)" }, at);
          tl.to(el, { scale: 1.08, duration: 0.18, yoyo: true, repeat: 3, ease: "sine.inOut" }, at + 0.5);
        },
      };
      // Glyphs a scramble passes through; picked by a hash of position and progress, so the
      // same frame always shows the same glyphs.
      const GLYPHS = "!<>-_/[]{}=+*^?#ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
      const glyph = (i, step) => GLYPHS[Math.abs(Math.imul(i + 1, 2654435761) ^ Math.imul(step + 7, 40503) ^ SEED) % GLYPHS.length];
      const colour = (name, fallback) => token(name, fallback);
      Object.assign(SPECIAL, {
        // Decodes from noise, left to right, keeping any markup inside (an <em> stays an <em>).
        scramble(el, at) {
          const nodes = [];
          const walk = (n) => n.childNodes.forEach((c) => (c.nodeType === 3 ? nodes.push(c) : c.nodeType === 1 && walk(c)));
          walk(el);
          const texts = nodes.map((n) => n.nodeValue), total = texts.reduce((a, t) => a + t.length, 0), state = { p: 0 };
          const show = () => {
            const shown = Math.floor(state.p * total), step = Math.floor(state.p * 24);
            let i = 0;
            nodes.forEach((n, k) => {
              n.nodeValue = [...texts[k]].map((ch) => { const j = i++; return j < shown || /\s/.test(ch) ? ch : glyph(j, step); }).join("");
            });
          };
          show();
          gsap.set(el, { opacity: 0 });
          tl.to(el, { opacity: 1, duration: 0.1 }, at);
          tl.to(state, { p: 1, duration: Math.min(1.2, 0.3 + total * 0.03), ease: "none", onUpdate: show }, at);
        },
        // Arrives split into colour channels, jitters, then settles.
        glitch(el, at) {
          const a = colour("--accent", "#ff3d8b"), b = colour("--accent-2", "#2de2e6");
          gsap.set(el, { opacity: 0 });
          tl.fromTo(el, { opacity: 0, x: -18, textShadow: `6px 0 ${a}, -6px 0 ${b}` }, { opacity: 1, x: 0, duration: 0.07, immediateRender: false }, at);
          tl.to(el, { x: 10, skewX: -8, duration: 0.05 }, at + 0.1);
          tl.to(el, { x: -6, skewX: 6, duration: 0.05 }, at + 0.16);
          tl.to(el, { x: 0, skewX: 0, textShadow: `0px 0 ${a}00, 0px 0 ${b}00`, duration: 0.3, ease: "power2.out" }, at + 0.22);
        },
        // Lands big and hard, with a short shake.
        slam(el, at) {
          gsap.set(el, { opacity: 0, scale: 2.4 });
          tl.to(el, { opacity: 1, scale: 1, duration: 0.32, ease: "power4.in" }, at);
          tl.to(el, { x: 7, duration: 0.04, yoyo: true, repeat: 5, ease: "none" }, at + 0.32);
          tl.set(el, { x: 0 }, at + 0.56);
        },
      });
      const ANIMS = [...Object.keys(SIMPLE), ...Object.keys(SPECIAL)];
      document.querySelectorAll("[data-at]").forEach((el) => {
        const name = el.dataset.anim || token("--entrance", "up"), at = +el.dataset.at;
        if (SPECIAL[name]) return SPECIAL[name](el, at);
        const a = SIMPLE[name];
        if (!a) throw new Error(`unknown data-anim ${name}: one of ${ANIMS.join(", ")}`);
        gsap.set(el, a[0]);
        tl.to(el, a[1], at);
      });

      let lastEnd = -1;
      document.querySelectorAll(".cap span").forEach((c) => {
        const t = +c.parentElement.dataset.start, e = t + +c.parentElement.dataset.duration;
        const follows = t - lastEnd < 0.1;   // the next line of a sentence: no blink between lines
        lastEnd = e;
        const words = [...c.querySelectorAll(".w")];
        gsap.set(c, { opacity: 0 });
        if (!words.length) {
          tl.to(c, { opacity: 1, duration: 0.15 }, t);
        } else {
          // Karaoke: the line pops in, each word lights in the accent as the voice reaches it,
          // then settles to the ink colour; words not yet spoken wait dimmed.
          if (follows) {
            tl.set(c, { opacity: 1 }, t);
            tl.fromTo(c, { y: 6 }, { y: 0, duration: 0.12, immediateRender: false }, t);
          } else {
            gsap.set(c, { scale: 0.92, y: 14 });
            tl.to(c, { opacity: 1, scale: 1, y: 0, duration: 0.18, ease: "back.out(2)" }, t);
          }
          gsap.set(words, { opacity: 0.38 });
          words.forEach((w, i) => {
            const at = Math.max(t, +w.dataset.wordAt), next = words[i + 1] ? +words[i + 1].dataset.wordAt : e;
            // A lift and a glow, never a scale: a scaled word grows into the spaces beside it.
            const hot = colour("--cap-hot", colour("--accent", "#ff7a3d"));
            tl.to(w, { opacity: 1, color: hot, y: -3, textShadow: `0 0 18px ${hot}`, duration: 0.08 }, at);
            tl.to(w, { color: colour("--cap-ink", "#ffffff"), y: 0, textShadow: "0 0 0px rgba(0,0,0,0)", duration: 0.18 }, Math.max(at + 0.1, next));
          });
        }
        tl.set(c, { opacity: 0 }, e);
      });

      window.__timelines["main"] = tl;
