"use client";
import { useEffect, useRef, useState } from "react";
import { Person } from "./Scenario.jsx";
import { PEOPLE, START, GOAL } from "./engine.js";
import { graph, suggestedMove } from "./learning.js";
import { crossing, crewProblem } from "./game.js";

export default function PuzzleGame({ forest }) {
  const [help, setHelp] = useState("none");
  const [hintVisible, setHintVisible] = useState(false);
  const [state, setState] = useState(START);
  const [crew, setCrew] = useState([]);
  const [steps, setSteps] = useState(0);
  const [travelling, setTravelling] = useState(false);
  const [boatSide, setBoatSide] = useState("0");
  const crossingTimer = useRef(null);
  const [message, setMessage] = useState(
    "Trascina un personaggio nella barca, oppure premi il suo pulsante.",
  );
  const [invalid, setInvalid] = useState(false);
  const [sound, setSound] = useState(true);
  const audio = useRef(null);
  const tone = useRef(null);
  const drag = useRef(null);
  const suppressClick = useRef(false);
  useEffect(
    () => () => {
      clearTimeout(crossingTimer.current);
      audio.current?.close().catch(() => {});
    },
    [],
  );
  function stopTone() {
    if (tone.current) {
      try {
        tone.current.stop();
      } catch {}
      tone.current = null;
    }
  }
  function warn(text) {
    setMessage(text);
    setInvalid(true);
    if (!sound) return;
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      audio.current ||= new Audio();
      const ctx = audio.current;
      void ctx.resume().catch(() => {});
      stopTone();
      const oscillator = ctx.createOscillator(),
        gain = ctx.createGain();
      oscillator.frequency.value = 220;
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 0.03);
      gain.gain.setValueAtTime(0.07, ctx.currentTime + 1.1);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.3);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 1.35);
      tone.current = oscillator;
    } catch {
      /* Visual feedback remains available when audio is unavailable. */
    }
  }
  function transfer(person, destination) {
    if (travelling) return;
    if (state === GOAL && !crew.length) return;
    if (destination === "boat") {
      if (crew.includes(person)) return;
      if (state[person + 1] !== state[0])
        return warn(
          "La barca è sull’altra sponda. Non puoi imbarcare questa persona.",
        );
      const next = [...crew, person];
      const problem = crewProblem(next);
      if (problem) return warn(problem);
      setCrew(next);
      setMessage(
        `${PEOPLE[person]} a bordo. Scegli gli altri passeggeri o attraversa.`,
      );
    } else {
      if (!crew.includes(person))
        return warn(
          "Sposta i personaggi tra la sponda e la barca: per cambiare sponda usa Attraversa.",
        );
      if (destination !== state[0])
        return warn("Puoi sbarcare solo sulla sponda dove si trova la barca.");
      setCrew(crew.filter((i) => i !== person));
      setMessage(`${PEOPLE[person]} sulla sponda.`);
    }
    stopTone();
    setInvalid(false);
  }
  function cross() {
    if (travelling) return;
    const result = crossing(state, crew);
    if (result.error) return warn(result.error);
    setHintVisible(false);
    setTravelling(true);
    setBoatSide(result.state[0]);
    setInvalid(false);
    stopTone();
    setMessage("Attraversamento in corso…");
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? 0
      : 850;
    crossingTimer.current = setTimeout(() => {
      setState(result.state);
      setCrew([]);
      setSteps((value) => value + 1);
      setTravelling(false);
      setMessage(
        "Attraversamento completato: i passeggeri sono sbarcati automaticamente. Prepara il prossimo viaggio.",
      );
    }, duration);
  }
  function personButton(person) {
    const aboard = crew.includes(person);
    return (
      <button
        key={person}
        disabled={travelling}
        className="game-person"
        aria-label={`${PEOPLE[person]} · ${aboard ? "sbarca" : "imbarca"}`}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          drag.current = { person, x: e.clientX, y: e.clientY };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerUp={(e) => {
          const start = drag.current;
          drag.current = null;
          if (!start) return;
          if (Math.hypot(e.clientX - start.x, e.clientY - start.y) < 8) return;
          suppressClick.current = true;
          setTimeout(() => {
            suppressClick.current = false;
          }, 0);
          const destination = document
            .elementFromPoint(e.clientX, e.clientY)
            ?.closest("[data-bank]")
            ?.getAttribute("data-bank");
          if (destination) transfer(person, destination);
          else warn("Rilascia il personaggio sulla barca o sulla sponda.");
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
        onClick={() => {
          if (!suppressClick.current)
            transfer(person, aboard ? state[0] : "boat");
        }}
      >
        <svg viewBox="0 0 100 125" aria-hidden="true">
          <Person index={person} x={50} y={48} />
        </svg>
      </button>
    );
  }
  const mode = help === "forest" && !forest ? "none" : help;
  const hint =
    mode === "none"
      ? null
      : suggestedMove(state, (s) =>
          mode === "bfs"
            ? graph.nodes.get(s).remaining
            : forest.predictions.get(s),
        );
  const won = state === GOAL && crew.length === 0;
  return (
    <section className="puzzle-game" aria-label="Gioca al puzzle">
      <div className="river-scene-heading">
        <div>
          <span>IL PUZZLE IN SCENA · GIOCA TU</span>
          <h2>Porta tutti sull’altra sponda</h2>
        </div>
        <strong>{steps} attraversamenti</strong>
      </div>
      <p>
        Trascina i personaggi tra sponda e barca. Puoi anche fare clic o usare
        Tab e Invio. Durante l’imbarco la barca è attraccata: le persone a bordo
        contano ancora sulla sponda; i vincoli sulle sponde vengono verificati
        quando premi Attraversa.
      </p>
      <section className="game-assistance" aria-label="Suggerimenti di gioco">
        <div className="lab-controls">
          <label>
            Aiuto durante la partita
            <select
              value={mode}
              disabled={travelling}
              onChange={(e) => {
                setHelp(e.target.value);
                setHintVisible(false);
              }}
            >
              <option value="none">Nessun suggerimento</option>
              <option value="bfs">BFS · suggerimenti ottimali</option>
              <option value="forest" disabled={!forest}>
                Random Forest
                {forest ? ` · seme ${forest.seed}` : " · da allenare"}
              </option>
            </select>
          </label>
          {mode !== "none" && (
            <button
              disabled={travelling || won}
              onClick={() => setHintVisible(true)}
            >
              Mostra suggerimento
            </button>
          )}
        </div>
        {mode === "bfs" && (
          <p>
            BFS indica una mossa sul percorso più breve dalla posizione attuale.
            Puoi scegliere se seguirla.
          </p>
        )}
        {mode === "forest" && (
          <p>
            Foresta corrente: seme {forest.seed}, {forest.trees} alberi. I
            suggerimenti possono essere non ottimali e portare a ripetere le
            stesse posizioni.
          </p>
        )}
        {!forest && (
          <p>
            Vuoi provare l’aiuto della foresta?{" "}
            <a href="#foresta">Allenala qui</a>, poi torna al gioco: la partita
            resta in corso.
          </p>
        )}
        {hintVisible && hint && !won && (
          <div className="game-hint" role="status">
            <strong>
              Fai attraversare {hint.crew.map((i) => PEOPLE[i]).join(" e ")}{" "}
              verso {state[0] === "0" ? "destra" : "sinistra"}.
            </strong>
            <p>
              {crew.length
                ? "Il suggerimento riguarda l’intero equipaggio: sostituisci i passeggeri già a bordo se necessario."
                : "Imbarca questi passeggeri, poi premi Attraversa."}
            </p>
          </div>
        )}
      </section>
      <div className="game-landscape">
        <div className="game-bank" data-bank="0" aria-label="Sponda sinistra">
          <h3>Sponda sinistra</h3>
          <div>
            {PEOPLE.map((_, i) =>
              state[i + 1] === "0" && !crew.includes(i)
                ? personButton(i)
                : null,
            )}
          </div>
        </div>
        <div className="game-river">
          <button
            className="crossing-button"
            disabled={won || travelling}
            onClick={cross}
          >
            {travelling
              ? "Attraversamento…"
              : `Attraversa ${state[0] === "0" ? "→" : "←"}`}
          </button>
          <div
            className={`game-boat side-${boatSide}`}
            data-bank="boat"
            aria-label="Barca"
            aria-busy={travelling}
          >
            <h3>Barca · {crew.length}/2 posti</h3>
            <div>{crew.map(personButton)}</div>
            <p>
              {travelling
                ? "In navigazione"
                : `Attraccata a ${state[0] === "0" ? "sinistra" : "destra"}`}
            </p>
          </div>
        </div>
        <div className="game-bank" data-bank="1" aria-label="Sponda destra">
          <h3>Sponda destra</h3>
          <div>
            {PEOPLE.map((_, i) =>
              state[i + 1] === "1" && !crew.includes(i)
                ? personButton(i)
                : null,
            )}
          </div>
        </div>
      </div>
      <p
        role={invalid ? "alert" : "status"}
        className={invalid ? "game-warning" : "game-status"}
      >
        {won
          ? `Puzzle risolto in ${steps} attraversamenti!${steps === 17 ? " Hai trovato un percorso minimo." : ""}`
          : message}
      </p>
      <div className="lab-controls">
        <button
          onClick={() => {
            clearTimeout(crossingTimer.current);
            setHintVisible(false);
            setTravelling(false);
            setBoatSide("0");
            stopTone();
            setState(START);
            setCrew([]);
            setSteps(0);
            setInvalid(false);
            setMessage("Nuova partita: tutti sulla sponda sinistra.");
          }}
        >
          Ricomincia
        </button>
        <label>
          <input
            type="checkbox"
            checked={sound}
            onChange={(e) => {
              setSound(e.target.checked);
              if (!e.target.checked) stopTone();
            }}
          />{" "}
          Avvisi sonori prolungati
        </label>
      </div>
    </section>
  );
}
