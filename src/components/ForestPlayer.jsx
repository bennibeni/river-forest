'use client';

import { useState } from 'react';
import Scenario from './Scenario.jsx';
import { START, GOAL } from './engine.js';
import { graph, canonical, rollout } from './learning.js';

export default function ForestPlayer({ forest, split }) {
  const [start, setStart] = useState(START);
  const [step, setStep] = useState(0);
  if (!forest) return <><h1>Osserva la foresta giocare.</h1><p className="lab-empty">Prima <a href="#foresta">addestra la foresta</a>. Potrai poi seguirne le decisioni e confrontare ogni previsione con la distanza esatta.</p></>;
  const run = rollout(start, s => forest.predictions.get(s));
  const position = Math.min(step, run.path.length - 1);
  const state = run.path[position];
  const test = split.test.includes(canonical(start));
  const finished = position === run.path.length - 1;
  const repeatedAt = run.reason === 'Ciclo' ? run.path.indexOf(run.path.at(-1)) : -1;
  return <>
    <h1>Le stime diventano decisioni.</h1><p>Il giocatore usa la foresta addestrata con seme {forest.seed} e {forest.trees} alberi. La distanza esatta è mostrata solo per confrontare i risultati.</p>
    <div className="lab-controls"><label>Configurazione di partenza<select value={start} onChange={e => { setStart(e.target.value); setStep(0); }}>{[...graph.nodes.keys()].sort().map(s => <option key={s} value={s}>{s === START ? 'Inizio · ' : s === GOAL ? 'Arrivo · ' : ''}{s}</option>)}</select></label><span className={`dataset-badge ${test ? 'test' : 'train'}`}>{test ? 'T · Test' : 'A · Allenamento'}</span></div>
    <section className={run.success ? 'lab-insight' : 'lab-insight forest-failure'} role="status"><h2>{finished ? (run.success ? 'Puzzle risolto' : 'Tentativo interrotto: puzzle non risolto') : 'Esito del tentativo completo'}</h2><p>{run.success ? `Arrivo dopo ${run.path.length - 1} attraversamenti.` : run.reason === 'Ciclo' ? `La foresta entra in un ciclo dopo ${run.path.length - 1} attraversamenti: torna alla configurazione già visitata al passo ${repeatedAt}. Il programma interrompe il tentativo per evitare ripetizioni senza fine.` : 'Il tentativo raggiunge il limite di mosse senza risolvere il puzzle.'} {!finished && `La scena mostra per ora il passo ${position}; usa Avanti per seguire il percorso.`}</p>{!run.success && <p>Le mosse rispettano le regole, ma le stime apprese possono condurre avanti e indietro. BFS non corregge la scelta della foresta. Puoi confrontare un altro seme o un diverso numero di alberi, senza garanzia di successo.</p>}</section>
    <Scenario state={state} />
    <div className="lab-controls"><button disabled={!position} onClick={() => setStep(position - 1)}>← Indietro</button><strong>Passo {position} / {run.path.length - 1}</strong><button disabled={position === run.path.length - 1} onClick={() => setStep(position + 1)}>Avanti →</button></div>
    <section className="lab-protocol"><strong>{run.reason} · {run.path.length - 1} attraversamenti eseguiti</strong><p>Minimo esatto dalla partenza scelta: {graph.nodes.get(start).remaining}. {run.success ? 'Confronta la lunghezza del percorso con questo riferimento.' : 'Il tentativo si ferma alla prima configurazione ripetuta o al limite di mosse.'}</p></section>
    <h2>Perché sceglie questo attraversamento?</h2><div className="lab-table"><table><thead><tr><th>Stato successivo</th><th>Stima della foresta ↓</th><th>Distanza esatta di confronto</th><th>Decisione</th></tr></thead><tbody>{graph.adjacency.get(state).map(m => <tr key={m.target}><td><code>{m.target}</code></td><td>{forest.predictions.get(m.target).toFixed(2)}</td><td>{graph.nodes.get(m.target).remaining}</td><td>{run.path[position + 1] === m.target ? 'Scelta della foresta' : '—'}</td></tr>)}</tbody></table></div>
    <p>Si preferisce la stima minore; a parità di stima vale l’ordine fisso delle mosse. Una mossa che raggiunge direttamente l’obiettivo ha priorità. All’arrivo la partita termina e non vengono scelte altre mosse.</p>
    <a href="#alberi">Esamina gli alberi e gli esiti delle singole partenze di test →</a>
  </>;
}
