export default function Method() {
  return (
    <>
      <h1>Capire il metodo Random Forest</h1>
      <p>
        <a href="#foresta">← Torna ad Allena la foresta</a>
      </p>{" "}
      <section className="lab-insight">
        <h2>Come viene utilizzata la Random Forest?</h2>
        <div className="lab-cards">
          <article>
            <h3>1. Preparare gli esempi</h3>
            <p>
              Il motore genera gli stati legali. BFS, una ricerca in ampiezza,
              calcola le distanze minime: sono le risposte corrette da cui
              imparare.
            </p>
          </article>
          <article>
            <h3>2. Imparare e verificare</h3>
            <p>
              La foresta impara da 41 configurazioni e viene verificata sulle
              altre 11. Ogni albero pone domande sulle caratteristiche; la media
              delle risposte stima gli attraversamenti rimanenti.
            </p>
          </article>
          <article>
            <h3>3. Scegliere una mossa</h3>
            <p>
              Tra gli attraversamenti legali, il giocatore sceglie quello la cui
              destinazione ha la distanza prevista minore. La qualità delle
              previsioni influisce sul percorso.
            </p>
          </article>
        </div>
        <p className="home-key">
          <strong>
            BFS è uno strumento di supporto all’implementazione e alla verifica.
          </strong>{" "}
          Prepara le etichette di allenamento e il riferimento esatto mostrato
          nei confronti. Non suggerisce né corregge le mosse della Random
          Forest: il giocatore usa le stime apprese e riconosce soltanto
          l’arrivo immediato come regola del gioco.
        </p>
      </section>
      <section className="lab-note">
        <h2>Che cosa dimostra questo laboratorio?</h2>
        <p>
          Una Random Forest può imparare a valutare le configurazioni di un
          puzzle partendo da esempi esatti. Una previsione numerica accurata e
          una buona strategia non sono la stessa cosa: per questo misuriamo sia
          gli errori sulle distanze sia i percorsi effettivamente giocati.
        </p>
        <p>
          Il laboratorio non garantisce una strategia perfetta. Con pochi stati,
          i risultati dipendono dalla divisione dei dati e dal seme. Le
          configurazioni equivalenti restano nello stesso gruppo: blu e sigla A
          per l’allenamento, viola e sigla T per il test. Le nuove partenze
          appartengono allo stesso puzzle, non a un problema completamente
          nuovo.
        </p>
        <p>
          Il test è escluso dall’addestramento. Scegliere ripetutamente il
          modello migliore guardando il test trasformerebbe quel test in un
          criterio di selezione: una verifica finale indipendente richiederebbe
          altri dati.
        </p>
        <p>
          I risultati restano disponibili passando tra le pagine; ricaricare
          l’app li azzera. I calcoli avvengono nel browser e non inviano dati a
          servizi esterni.
        </p>
      </section>
    </>
  );
}
