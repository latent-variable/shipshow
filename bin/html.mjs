// Shared helpers for the lightweight HTML readers and writers in bin/.
export const htmlAttr = (attrs, name) => attrs.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`))?.[1];

export const escapeHtml = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Cue and reading-time walks share this set. frame.mjs also treats base and param as void.
export const HTML_VOID_ELEMENTS = /^(area|br|col|embed|hr|img|input|link|meta|source|track|wbr)$/i;
