import React from "react";
const FACADES = ["#2b2b2e", "#9e3b2e", "#c2993f", "#3a5a78", "#6f7f53"];
function hash(s) {
  let h = 0;
  const str = String(s || "x");
  for (let i = 0; i < str.length; i++) h = h * 31 + str.charCodeAt(i) >>> 0;
  return h;
}
function BuildingArt({ seed }) {
  const h = hash(seed);
  const facade = FACADES[h % FACADES.length];
  const neighbour = FACADES[(h + 2) % FACADES.length];
  const frame = "#f3efe6";
  const door = facade === "#9e3b2e" ? "#2b2b2e" : "#9e3b2e";
  const u = h % 997;
  return <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Faroese building"><defs><linearGradient id={`sky${u}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#cfe2ec" /><stop offset="1" stopColor="#e9eef0" /></linearGradient><linearGradient id={`turf${u}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5f8a4a" /><stop offset="1" stopColor="#3f6531" /></linearGradient></defs><rect width="400" height="240" fill={`url(#sky${u})`} /><path d="M0 150 Q120 108 230 148 T400 138 V240 H0 Z" fill="#9fb0a2" opacity="0.5" /><rect y="196" width="400" height="44" fill="#b6a888" /><g opacity="0.92"><rect x="40" y="150" width="72" height="50" fill={neighbour} /><path d="M33 152 L76 123 L119 152 Z" fill={`url(#turf${u})`} /><rect x="60" y="166" width="22" height="22" fill="#cdd6dc" stroke={frame} strokeWidth="4" /></g><g><rect x="120" y="120" width="160" height="80" fill={facade} /><path d="M110 122 L200 76 L290 122 Z" fill={`url(#turf${u})`} /><path d="M110 122 L200 76 L290 122 Z" fill="none" stroke="#34552a" strokeWidth="2" /><rect x="138" y="140" width="34" height="34" fill="#cdd6dc" stroke={frame} strokeWidth="5" /><rect x="228" y="140" width="34" height="34" fill="#cdd6dc" stroke={frame} strokeWidth="5" /><rect x="186" y="150" width="28" height="50" fill={door} stroke={frame} strokeWidth="4" /></g></svg>;
}
export {
  BuildingArt as default
};
