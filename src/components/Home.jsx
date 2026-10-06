import PuzzleGame from "./PuzzleGame.jsx";
import "./styles.css";

export default function Home({ forest }) {
  return (
    <main>
      <header>
        <div>
          <div className="eyebrow">RIVER · IL PUZZLE E LA FORESTA</div>
          <h1>Il puzzle della famiglia giapponese</h1>
          <p>
            Porta tutti sull’altra sponda rispettando le regole. Prova da solo
            oppure scegli un aiuto.
          </p>
        </div>
      </header>
      <PuzzleGame forest={forest} />
      <section className="lab-insight">
        <h2>Il puzzle: obiettivo e regole</h2>
        <p>
          Padre, madre, due figli, due figlie, poliziotto e criminale si trovano
          sulla sponda sinistra. Devi portarli tutti sulla destra.
        </p>
        <ol className="home-rules">
          <li>
            La barca trasporta una o due persone e non può viaggiare vuota.
          </li>
          <li>
            Solo padre, madre e poliziotto possono guidarla: almeno uno deve
            essere a bordo.
          </li>
          <li>Il padre non può restare con le figlie senza la madre.</li>
          <li>La madre non può restare con i figli senza il padre.</li>
          <li>
            Il criminale non può restare con un familiare senza il poliziotto.
          </li>
          <li>
            I vincoli valgono su entrambe le sponde e a bordo della barca.
          </li>
        </ol>
        <p>
          <strong>La soluzione minima richiede 17 attraversamenti.</strong> I
          percorsi minimi sono otto distinguendo i fratelli, solo due
          considerando intercambiabili i due figli e le due figlie.
        </p>
      </section>
      <div className="home-paths">
        <a href="#grafo">
          <span>IL PUZZLE</span>
          <strong>Esplora le sponde e i cammini →</strong>
          <p>
            Comprendi i vincoli e osserva le conseguenze di ogni
            attraversamento.
          </p>
        </a>
        <a href="#foresta">
          <span>IL METODO</span>
          <strong>Allena una Random Forest →</strong>
          <p>
            Dagli esempi alle previsioni, fino alle decisioni durante una
            partita.
          </p>
        </a>
      </div>
      <footer className="projects-footer">
        <a href="https://links-page-bennibeni.vercel.app/">
          &larr; All projects
        </a>
      </footer>
    </main>
  );
}
