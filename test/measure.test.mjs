// The reading-time text of a cued element (bin/measure.mjs, #127, D102): an SVG figure's path data and styles are not reading.
import { test } from "node:test";
import assert from "node:assert/strict";
import { elementAt, readableText, readingSeconds } from "../bin/measure.mjs";

const path = `<path d="${"M 10.5 -20.1 L 30.2 40.9 ".repeat(400)}Z"`;
const script = `<script>const tl = gsap.timeline(); tl.to(".a", { x: 10 }); function go(a_b) { return a_b.c_d; }</script>`;

test("an SVG figure is read by its labels, not its path data, styles or the page after it", () => {
  const html = `<section>${script}<svg data-cue="x" viewBox="0 0 10 10"><style>.a { fill: red; } .b_c { stroke: blue; }</style><defs><clipPath id="c">${path}/></clipPath></defs>${path}/><text x="1">a shifted wave</text><text>1 unit</text></svg>${script}<p>after</p></section>`;
  const el = elementAt(html, html.indexOf("<svg"));
  assert.equal(el.text, "a shifted wave 1 unit");
  assert.ok(readingSeconds(el.text) < 3);
});

test("a cued SVG shape written without a close is empty and does not run on to the end of the page", () => {
  const html = `<svg>${path} data-cue="m">${script}<text>label</text></svg>`;
  const el = elementAt(html, html.indexOf("<path"));
  assert.equal(el.text, "");
  assert.equal(html.slice(0, el.end).endsWith(`data-cue="m">`), true);
});

test("readableText drops tags, style, script and defs and keeps the words", () => {
  assert.equal(readableText(`<b>one</b> &amp; <i>two</i><style>.x{}</style>`), "one & two");
});
