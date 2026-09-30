import { useEffect, useMemo, useRef, useState } from 'react';
import { buildGraph, GOAL, pathToGoal, PEOPLE, SHORT, START } from './engine.js';
import { canonical } from './learning.js';
import Scenario from './Scenario.jsx';

const graph = buildGraph();
const route = pathToGoal(graph);
const levels = Array.from({ length: Math.max(...[...graph.nodes.values()].map(n => n.depth)) + 1 }, (_, depth) => [...graph.nodes.values()].filter(n => n.depth === depth));
const positions = new Map(levels.flatMap((nodes, level) => nodes.map((node, i) => [node.id, { x: 65 + level * 112, y: 75 + (i + 1) * 530 / (nodes.length + 1) }])));
const width = levels.length * 112 + 20;
const edgeKey = (a, b) => [a, b].sort().join(':');

export default function App({ split }) {
  const [selected, setSelected] = useState(START);
  const [showRoute, setShowRoute] = useState(true);
  const [step, setStep] = useState(0);
  const [zoom, setZoom] = useState(1);
  const canvas = useRef(null);
  const pan = useRef(null);
  const moved = useRef(false);
  const [center, setCenter] = useState({ x: width / 2, y: 325 });
  const [aspect, setAspect] = useState(2);
  const viewWidth = width / zoom;
  const viewHeight = viewWidth / aspect;
  function changeZoom(value) {
    setZoom(Math.min(4, Math.max(1, value)));
    setCenter(positions.get(selected));
  }
  useEffect(() => {
    const el = canvas.current;
    const observer = new ResizeObserver(() => setAspect(el.clientWidth / el.clientHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const el = canvas.current;
    const wheel = event => {
      event.preventDefault();
      setZoom(current => Math.min(4, Math.max(1, current * Math.exp(-event.deltaY * .002))));
      setCenter(positions.get(selected));
    };
    el.addEventListener('wheel', wheel, { passive: false });
    return () => el.removeEventListener('wheel', wheel);
  }, [selected]);
  function select(id) {
    setSelected(id);
    if (zoom > 1) setCenter(positions.get(id));
  }
  const node = graph.nodes.get(selected);
  const continuation = useMemo(() => pathToGoal(graph, selected), [selected]);
  const marked = new Set(showRoute ? route.slice(1).map((id, i) => edgeKey(route[i], id)) : []);
  const neighbors = graph.adjacency.get(selected);
  const adjacent = new Set(neighbors.map(m => m.target));
  const testStates = new Set(split?.test || []);
  const group = s => testStates.has(canonical(s)) ? 'test' : 'train';
  function jump(index) { setStep(index); select(route[index]); }
  function download() {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ nodes: [...graph.nodes.values()], edges: graph.edges, shortestPath: route }, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'river-grafo.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <main>
    <header><div><div className="eyebrow">RIVER · LABORATORIO DI STRATEGIE</div><h1>Esplora le possibilità del puzzle.</h1><p>Questo grafo è costruito con BFS, una ricerca sistematica di tutti gli stati raggiungibili.</p></div><button onClick={download}>Esporta grafo ↗</button></header>
    <section className="stats" aria-label="Statistiche del grafo">{[[graph.nodes.size, 'stati raggiungibili'], [graph.edges.length, 'collegamenti reversibili'], [route.length - 1, 'attraversamenti minimi']].map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</section>
    <p className="lab-insight">BFS calcola stati, collegamenti e distanze esatte. Il seme della foresta cambia solo la suddivisione blu/viola; numero di alberi e addestramento non modificano il grafo. <a href="#bfs"><strong>Come funziona BFS →</strong></a></p>
    <div className="initial-reminder"><Scenario state={START} compact /></div>
    {split && <p className="dataset-legend">I colori anticipano un esperimento descritto nelle pagine sulla foresta: le <span className="dataset-badge train">configurazioni blu</span> vengono mostrate al computer come esempi da cui imparare; quelle <span className="dataset-badge test">viola, con bordo tratteggiato</span> servono a verificare ciò che ha imparato. Il colore non indica una mossa giusta o sbagliata.</p>}
    <div className="workspace"><section className="panel graph-panel"><div className="toolbar"><div><h2>Lo spazio delle decisioni</h2><p>Da sinistra a destra: distanza minima dalla partenza.</p></div><label><input type="checkbox" checked={showRoute} onChange={e => setShowRoute(e.target.checked)} /> Un percorso minimo</label></div>
      <div className="legend"><span>Numero = distanza esatta</span><span>INIZIO / FINE = estremi</span><span className="orange">Bordo arancione = selezione</span><label>Zoom <input aria-label="Zoom del grafo" type="range" min="1" max="4" step="0.1" value={zoom} onChange={e => changeZoom(Number(e.target.value))} /></label><button onClick={() => { setZoom(1); setCenter({ x: width / 2, y: 325 }); }}>Mostra tutto</button><button onClick={() => setCenter(positions.get(selected))}>Centra selezione</button></div>
      <div className="canvas graph-viewport" ref={canvas} onPointerDown={e => { if (e.button !== 0) return; moved.current = false; pan.current = { x: e.clientX, y: e.clientY, center }; }} onPointerMove={e => { if (!pan.current) return; const dx = e.clientX - pan.current.x, dy = e.clientY - pan.current.y; if (Math.hypot(dx, dy) > 5) { moved.current = true; e.currentTarget.setPointerCapture(e.pointerId); setCenter({ x: pan.current.center.x - dx * viewWidth / e.currentTarget.clientWidth, y: pan.current.center.y - dy * viewHeight / e.currentTarget.clientHeight }); } }} onPointerUp={() => { pan.current = null; }} onPointerCancel={() => { pan.current = null; }}><svg role="group" aria-label="Grafo interattivo: seleziona uno stato" viewBox={`${center.x - viewWidth / 2} ${center.y - viewHeight / 2} ${viewWidth} ${viewHeight}`}>
        {levels.map((_, i) => <g key={i}><line x1={65 + i * 112} x2={65 + i * 112} y1="60" y2="610" className="gridline" /><text x={65 + i * 112} y="35" className="level">{i}</text></g>)}
        {graph.edges.map(e => { const a = positions.get(e.source), b = positions.get(e.target); const active = marked.has(edgeKey(e.source, e.target)); return <line key={edgeKey(e.source, e.target)} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={active ? 'edge path' : 'edge'} />; })}
        {[...graph.nodes.values()].map(n => { const p = positions.get(n.id); const endpoint = n.id === START || n.id === GOAL; return <g key={n.id} role="button" tabIndex="0" aria-label={`Stato ${n.id}, ${split ? (group(n.id) === 'test' ? 'test, ' : 'allenamento, ') : ''}${n.remaining} attraversamenti all'obiettivo`} onClick={() => { if (!moved.current) select(n.id); }} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(n.id); } }} className={`node ${split ? group(n.id) : ''} ${endpoint ? 'endpoint' : ''} ${adjacent.has(n.id) ? 'neighbor' : ''} ${selected === n.id ? 'selected' : ''}`}><title>{`${n.id} · ${n.remaining} attraversamenti all'obiettivo`}</title><circle cx={p.x} cy={p.y} r="16" /><text x={p.x} y={p.y + 5}>{n.remaining}</text>{endpoint && <text className="endpoint-label" x={p.x} y={p.y + 36}>{n.id === START ? 'INIZIO' : 'FINE'}</text>}</g>; })}
      </svg></div><p className="caption">Rotellina: zoom sul nodo selezionato. Trascina lo sfondo per spostare il grafo. Il numero nel nodo indica gli attraversamenti minimi rimanenti.</p>
      <div className="playback"><button disabled={step === 0} onClick={() => jump(step - 1)}>←</button><div><strong>Soluzione minima · passo {step} / {route.length - 1}</strong><input aria-label="Passo della soluzione minima" type="range" min="0" max={route.length - 1} value={step} onChange={e => jump(Number(e.target.value))} /></div><button disabled={step === route.length - 1} onClick={() => jump(step + 1)}>→</button></div>
    </section>
      <aside className="panel detail"><div className="eyebrow">CONFIGURAZIONE SELEZIONATA</div><h2>{selected === GOAL ? 'Tutti a destinazione' : selected === START ? 'Pronti a partire' : 'Sulle due sponde'}</h2><code>{selected}</code><div className="banks">{['0', '1'].map(side => <section key={side}><h3>{side === '0' ? 'Sponda sinistra' : 'Sponda destra'} {selected[0] === side && <span className="boat-marker"><svg viewBox="0 0 64 38" aria-hidden="true"><path d="M5 18 H59 L49 32 H16Z" fill="#895434" stroke="#54341f" strokeWidth="3" /><path d="M10 17 H54 M23 4 L44 29" stroke="#d3984c" strokeWidth="5" strokeLinecap="round" /><path d="M3 36 Q12 31 21 36 T39 36 T61 36" fill="none" stroke="#287568" strokeWidth="3" /></svg>Barca qui</span>}</h3><div className="people">{PEOPLE.map((name, i) => selected[i + 1] === side && <span key={name}>{name}</span>)}{!PEOPLE.some((_, i) => selected[i + 1] === side) && <em>Nessuno</em>}</div></section>)}</div><p><strong>{node.remaining}</strong> attraversamenti minimi ancora necessari.</p><h3>Attraversamenti disponibili</h3><div className="moves">{neighbors.map(m => <button key={m.target} onClick={() => select(m.target)}><span>{m.crew.map(i => SHORT[i]).join(' + ')} {selected[0] === '0' ? '→' : '←'}</span><small>{graph.nodes.get(m.target).remaining} rimanenti</small></button>)}</div>{selected !== GOAL && <button className="primary" onClick={() => select(continuation[1])}>Esegui una mossa ottimale →</button>}<p className="note">Ogni attraversamento è reversibile. Un ramo senza uscita richiede di tornare indietro, non rappresenta una sconfitta definitiva.</p></aside></div>
    <p className="note">Le regole e la guida sono nella <a href="#inizio">pagina iniziale</a>. Qui esplori liberamente il grafo; puoi giocare trascinando i personaggi nella pagina iniziale.</p>
  </main>;
}

