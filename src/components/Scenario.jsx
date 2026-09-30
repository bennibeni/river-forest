import React from 'react';
import { PEOPLE } from './engine.js';
import './scenario.css';

const COLORS = ['#3e7284', '#b16e53', '#629878', '#629878', '#b58c48', '#b58c48', '#435b89', '#79716a'];

export function Person({ index, x, y }) {
  const child = index >= 2 && index <= 5;
  const female = index === 1 || index === 4 || index === 5;
  return <g transform={`translate(${x} ${y})`}>
    <ellipse cy="38" rx="22" ry="5" fill="#263d3020" />
    <g transform={child ? 'translate(0 8) scale(.82)' : undefined}>
      <path d="M-9 22 L-11 35 M9 22 L11 35" stroke="#354b45" strokeWidth="7" strokeLinecap="round" />
      {female ? <path d="M-10 -5 H10 L23 27 H-23Z" fill={COLORS[index]} /> : <rect x="-15" y="-5" width="30" height="31" rx="7" fill={COLORS[index]} />}
      {child && female && <path d="M-14 -24 Q-23 -10 -15 1 M14 -24 Q23 -10 15 1" fill="none" stroke="#51443b" strokeWidth="10" strokeLinecap="round" />}
      {index === 0 && <path d="M-5 -4 L0 1 L5 -4 L3 16 L0 20 L-3 16Z" fill="#f4e4b9" />}
      {child && !female && <path d="M-13 19 H13 M0 20 V29" stroke="#263f51" strokeWidth="6" />}
      {child && female && <><path d="M-15 -26 L-23 -31 V-19Z M15 -26 L23 -31 V-19Z" fill="#9b3768" /><path d="M-15 13 H15" stroke="#f7e7bf" strokeWidth="4" /></>}
      <path d="M-15 2 L-21 17 M15 2 L21 17" stroke={COLORS[index]} strokeWidth="6" strokeLinecap="round" />
      {index === 1 && <path d="M-14 -17 Q-17 -35 0 -34 Q18 -33 14 -13 L12 -5 L7 -8 L9 -22 H-9 L-10 -7 L-15 -8Z" fill="#51443b" />}
      <circle cy="-18" r="12" fill="#e7b98e" />
      <path d="M-12 -20 Q-12 -35 0 -32 Q14 -32 12 -19 L7 -24 L-7 -24Z" fill="#51443b" />
      <circle cx="-4" cy="-17" r="1.3" fill="#40372e" /><circle cx="4" cy="-17" r="1.3" fill="#40372e" />
      {index === 0 && <path d="M-7 -11 Q-3 -16 0 -12 Q3 -16 7 -11" fill="#51443b" />}
      {index === 1 && <><path d="M-8 0 Q0 8 8 0" fill="none" stroke="#f5dda0" strokeWidth="3" /></>}
      {index === 6 && <><path d="M-15 -27 L15 -27 L11 -36 L-11 -36Z" fill="#35476b" /><rect x="-3" y="1" width="6" height="7" rx="2" fill="#edc66f" /></>}
      {index === 7 && <><path d="M-13 4 H13 M-13 14 H13" stroke="#d8d3c9" strokeWidth="4" /><path d="M-11 -20 H11" stroke="#655d56" strokeWidth="6" /></>}
    </g>
    <text y="58" textAnchor="middle" className="river-person-label">{PEOPLE[index]}</text>
  </g>;
}

export default function Scenario({ state, compact = false }) {
  const left = PEOPLE.flatMap((_, i) => state[i + 1] === '0' ? [i] : []);
  const right = PEOPLE.flatMap((_, i) => state[i + 1] === '1' ? [i] : []);
  const bank = state[0] === '0' ? 'sinistra' : 'destra';
  const description = `Sponda sinistra: ${left.map(i => PEOPLE[i]).join(', ') || 'nessuno'}. Sponda destra: ${right.map(i => PEOPLE[i]).join(', ') || 'nessuno'}. Barca sulla sponda ${bank}.`;
  return <section className="river-scene" aria-label="Scenario del fiume">
    <div className="river-scene-heading"><div><span>IL PUZZLE IN SCENA</span><h2>{compact ? "Posizione iniziale" : "Chi si trova su ogni sponda?"}</h2></div><p aria-live="polite">Barca a {bank} · {left.length} a sinistra / {right.length} a destra</p></div>
    <div className="river-scene-scroll"><svg viewBox="0 0 1000 355" role="img" aria-label={description}>
      <rect width="1000" height="355" rx="18" fill="#e9efdd" />
      <path d="M360 0 C420 100 365 180 400 260 Q420 320 390 355 H640 Q600 290 632 220 C670 120 590 65 645 0Z" fill="#afd3d1" />
      <path d="M380 0 C440 100 385 180 420 260 Q440 320 410 355 M625 0 C570 65 650 120 612 220 Q580 290 620 355" fill="none" stroke="#d3e6dc" strokeWidth="7" />
      {[70, 125, 210, 280, 320].map((y, i) => <path key={y} d={`M${455 + (i % 2) * 35} ${y} q15 -6 30 0 t30 0`} fill="none" stroke="#e5f4ec" strokeWidth="3" strokeLinecap="round" />)}
      <text x="180" y="35" textAnchor="middle" className="river-bank-label">SPONDA SINISTRA</text><text x="820" y="35" textAnchor="middle" className="river-bank-label">SPONDA DESTRA</text>
      {[left, right].map((group, side) => <g key={side}>{group.map((person, slot) => <Person key={person} index={person} x={side * 650 + 60 + (slot % 4) * 78} y={105 + Math.floor(slot / 4) * 130} />)}{group.length === 0 && <text x={side ? 820 : 180} y="180" textAnchor="middle" className="river-empty">Nessuno su questa sponda</text>}</g>)}
      <g transform={`translate(${state[0] === '0' ? 437 : 567} 175)`}>
        <ellipse cy="20" rx="48" ry="10" fill="#619a9d" opacity=".25" />
        <path d="M-44 -8 H44 L30 16 Q0 28 -30 16Z" fill="#8c5c3e" stroke="#68482f" strokeWidth="2" />
        <path d="M-38 -5 H38" stroke="#d6ae78" strokeWidth="6" strokeLinecap="round" />
        <path d="M-19 -22 L27 28" stroke="#68482f" strokeWidth="5" strokeLinecap="round" /><path d="M22 22 L32 34" stroke="#ac7b4c" strokeWidth="10" strokeLinecap="round" />
        <text y="58" textAnchor="middle" className="river-person-label">Barca · 2 posti</text>
      </g>
    </svg></div>
    {!compact && <p className="river-scene-help">La scena rappresenta la configurazione corrente e la posizione della barca.</p>}
  </section>;
}

