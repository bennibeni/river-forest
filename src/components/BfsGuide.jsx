export default function BfsGuide() {
  return (
    <>
      <h1>BFS: esplorare il puzzle un passo alla volta.</h1>
      <p>
        BFS significa «ricerca in ampiezza». Parte da una configurazione ed
        esplora prima tutte quelle raggiungibili in un attraversamento, poi in
        due, poi in tre, senza visitare due volte lo stesso stato. Ogni
        attraversamento conta uno: per questo la prima distanza trovata è
        minima.
      </p>
      <div className="lab-cards">
        <article>
          <h2>1. Costruire la mappa</h2>
          <p>
            Dalla partenza, il programma genera solo attraversamenti consentiti
            dalle regole. Una coda conserva le configurazioni ancora da
            esplorare. Si ottengono 76 stati e 80 collegamenti reversibili.
          </p>
        </article>
        <article>
          <h2>2. Calcolare le distanze</h2>
          <p>
            La prima BFS determina la distanza dalla partenza, rappresentata
            dalle colonne del grafo. Una seconda BFS parte dall’arrivo e calcola
            gli attraversamenti minimi rimanenti: sono i numeri dentro i nodi.
          </p>
        </article>
        <article>
          <h2>3. Preparare gli esempi</h2>
          <p>
            Le distanze esatte diventano le risposte degli esempi per la Random
            Forest. Solo quelle delle configurazioni di allenamento vengono
            usate per istruirla; quelle di test servono per misurare gli errori.
          </p>
        </article>
      </div>
      <section className="lab-insight">
        <h2>Il percorso evidenziato è l’unico?</h2>
        <p>
          No. Nel grafo attuale esistono 8 percorsi minimi di 17
          attraversamenti, distinguendo Figlio 1 da Figlio 2 e Figlia 1 da
          Figlia 2. La casella «Un percorso minimo» ne mostra uno: a ogni passo
          il programma sceglie il primo vicino che riduce di uno la distanza
          dall’arrivo. L’ordine delle mosse decide quale percorso viene
          mostrato.
        </p>
      </section>
      <h2>Che cosa dipende dalla foresta?</h2>
      <p>
        Il seme decide quali configurazioni sono esempi e quali sono riservate
        alla verifica: nella pagina 02 cambiano solo i colori blu e viola.
        Stati, collegamenti, numeri, percorso evidenziato e pulsante «Esegui una
        mossa ottimale» dipendono dal motore del puzzle e da BFS, non dalle
        previsioni della foresta. Il numero di alberi e l’addestramento non li
        modificano.
      </p>
      <h2>Perché usare una foresta se BFS sa già risolverlo?</h2>
      <p>
        Questo piccolo puzzle permette di conoscere le risposte esatte e
        osservare come un modello impara ad approssimarle. BFS prepara gli
        esempi e il riferimento di verifica. Nella pagina «La foresta gioca» le
        mosse sono invece valutate con le stime della foresta; le regole
        stabiliscono quali sono ammesse. Non si dimostra che la foresta sia
        necessaria o migliore di BFS per risolvere questo puzzle.
      </p>
      <p>
        <a href="#grafo">← Torna a esplorare il puzzle</a> ·{" "}
        <a href="#foresta">Allena la foresta →</a>
      </p>
    </>
  );
}
