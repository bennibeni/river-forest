'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import App from './App.jsx';
import Home from './Home.jsx';
import Method from './Method.jsx';
import BfsGuide from './BfsGuide.jsx';
import ForestPlayer from './ForestPlayer.jsx';
import TreeCatalogue from './TreeCatalogue.jsx';
import { splitData, trainForest, evaluate } from './learning.js';
import './laboratory.css';

const pages = [['inizio', '01 · Gioca al puzzle'], ['grafo', '02 · Esplora il puzzle'], ['foresta', '03 · Allena la foresta'], ['alberi', '04 · Dentro gli alberi'], ['confronto', '05 · La foresta gioca'], ['bfs', '06 · Come funziona BFS']];
const subscribe = callback => { window.addEventListener('hashchange', callback); return () => window.removeEventListener('hashchange', callback); };
const snapshot = () => window.location.hash.slice(1);
const serverSnapshot = () => 'inizio';
const fmt = n => n == null ? '—' : n.toFixed(2);

function Results({ label, stats }) {
  return <div className="lab-metric"><span>{label}</span><strong>{stats.wins} / {stats.total}</strong><small>partenze risolte · {fmt(stats.extra)} mosse extra medie sui successi</small></div>;
}

export default function Laboratory() {
  const hash = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const page = (hash === 'bfs' || hash === 'metodo' || pages.some(([key]) => key === hash)) ? hash : 'inizio';
  const [seed, setSeed] = useState(42);
  const [trees, setTrees] = useState(50);
  const [forest, setForest] = useState(null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const job = useRef(0);
  useEffect(() => () => { job.current++; }, []);
  useEffect(() => { window.scrollTo(0, 0); const heading = document.querySelector('[data-page-active] h1'); if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); } }, [page]);
  const split = splitData(seed);
  async function run(kind) {
    const token = ++job.current;
    setBusy(kind); setError('');
    try {
      await new Promise(resolve => setTimeout(resolve, 20));
      if (token !== job.current) return;
      if (kind === 'forest') setForest(trainForest(split, seed, trees));
    } catch (e) { if (token === job.current) setError(`Esperimento non riuscito: ${e.message}`); }
    finally { if (token === job.current) setBusy(''); }
  }
  return <div className="river-lab">
    <nav className="lab-nav" aria-label="Pagine del laboratorio River">{[[pages.slice(0, 2), 'Gioca ed esplora'], [pages.slice(2), 'Approfondisci']].map(([links, title]) => <div className="nav-group" key={title}><span>{title}</span><div>{links.map(([key, label]) => <a key={key} href={`#${key}`} aria-current={page === key || (page === 'metodo' && key === 'foresta') ? 'page' : undefined}>{label}</a>)}</div></div>)}</nav>
    <div hidden={page !== 'inizio'} data-page-active={page === 'inizio' ? '' : undefined}><Home forest={forest} /></div>
    {page !== 'inizio' && <div data-page-active><p className="page-return"><a href="#inizio">← Riprendi la partita</a><span>La partita resta disponibile mentre esplori.</span></p>{page === 'grafo' ? <App split={split} seed={seed} /> : <main>
      <div className="eyebrow">RIVER · IMPARARE A DECIDERE</div>
      {page === 'foresta' && <section className="lab-protocol"><label>Esperimento riproducibile · seme<select disabled={!!busy} value={seed} onChange={e => { setSeed(Number(e.target.value)); setForest(null); }}>{[42, 137, 2026, 7, 91].map(n => <option key={n}>{n}</option>)}</select></label><p><strong>{split.train.length} configurazioni per imparare · {split.test.length} per il test.</strong> I 76 stati diventano 52 configurazioni distinguendo solo il numero di figli e figlie su ciascuna sponda. Divisione circa 80/20; cambiare seme azzera i risultati.</p></section>}
      {page === 'metodo' && <Method />}
      {page === 'bfs' && <BfsGuide />}
      {error && <p role="alert">{error}</p>}
      {page === 'alberi' && <TreeCatalogue forest={forest} />}
      {page === 'foresta' && forest && <p><a href="#alberi">Esplora i {forest.trees} alberi della foresta →</a></p>}
      {page === 'foresta' && <>
        <h1>Una foresta che impara le distanze.</h1><details className="lab-insight"><summary>Che cosa cambia con il seme?</summary><p>Il seme guida la divisione tra allenamento e test e le estrazioni casuali di esempi e caratteristiche per gli alberi. Stesso seme, stessi dati e stessi parametri riproducono lo stesso allenamento. Semi diversi possono produrre foreste e risultati diversi, ma non garantiscono modelli distinti o una soluzione del puzzle.</p><p>I semi non sono infiniti: questa implementazione usa 32 bit, cioè 4.294.967.296 valori effettivi. Il selettore propone cinque esempi pratici: 42, 137, 2026, 7 e 91. Il seme riguarda l’intera foresta, non il numero dei suoi alberi.</p></details><p className="lab-insight"><a href="#metodo"><strong>Come funziona il metodo e che cosa dimostra il laboratorio →</strong></a></p><p>La BFS conosce gli attraversamenti minimi da ogni stato. La Random Forest riceve solo gli esempi di allenamento e impara a stimare questa distanza combinando alberi di regressione.</p>
        <details className="lab-insight"><summary>Come avviene l’allenamento?</summary><div className="lab-cards"><article><h2>1. Osserva</h2><p>Posizioni, numero di figli, guide disponibili e mosse legali: 10 caratteristiche osservabili. Nessuna distanza esatta tra gli input.</p></article><article><h2>2. Impara</h2><p>Ogni albero usa un campione di esempi con reinserimento e un sottoinsieme di caratteristiche. La previsione è la media degli alberi.</p></article><article><h2>3. Verifica</h2><p>Le distanze degli {split.test.length} stati di test restano escluse dall’addestramento. Poi controlliamo anche i percorsi scelti.</p></article></div></details>
        <div className="lab-controls"><label>Alberi<select disabled={!!busy} value={trees} onChange={e => { setTrees(Number(e.target.value)); setForest(null); }}>{[10, 50, 100].map(n => <option key={n}>{n}</option>)}</select></label><button disabled={!!busy} onClick={() => run('forest')}>{busy === 'forest' ? 'Addestramento…' : 'Addestra la foresta'}</button></div>
        {forest ? <><div className="lab-metrics"><div className="lab-metric"><span>Errore assoluto medio sul test</span><strong>{fmt(forest.mae)}</strong><small>attraversamenti · {forest.trees} alberi</small></div><Results label="Percorsi dalle partenze di test" stats={evaluate(split.test, s => forest.predictions.get(s))} /></div><div className="lab-table"><table><thead><tr><th>Configurazione di test</th><th>Distanza esatta</th><th>Previsione</th><th>Errore assoluto</th></tr></thead><tbody>{forest.rows.map(r => <tr key={r.state}><td><code>{r.state}</code></td><td>{r.actual}</td><td>{fmt(r.predicted)}</td><td>{fmt(Math.abs(r.actual - r.predicted))}</td></tr>)}</tbody></table></div><div className="lab-controls"><a href="#inizio">Gioca con i suggerimenti della foresta →</a><a href="#confronto">Guarda la foresta giocare da sola →</a><a href="#alberi">Esamina gli alberi →</a></div></> : <p className="lab-empty">Avvia l’addestramento per ottenere misure reali, calcolate nel browser.</p>}
      </>}
      {page === 'confronto' && <ForestPlayer forest={forest} split={split} />}
    </main>}</div>}
  </div>;
}
