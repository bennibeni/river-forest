# River · Il puzzle e la foresta

Applicazione autonoma React / Next.js derivata dai contenuti di R40. Il progetto originale non viene modificato.

## Avvio

`npm install`

`npm run dev` — http://localhost:3010

`npm run build` e `npm start` per la versione di produzione.

## Percorso

- Pagina iniziale: puzzle giocabile, regole e obiettivo. Trascinamento, clic e tastiera per imbarcare/sbarcare; avvisi visivi e beep disattivabili per le operazioni vietate.
- Esplora il puzzle: scenario e grafo interattivo con colori allenamento/test.
- Allena la foresta: semi, 10/50/100 alberi, divisione 41/11.
- Dentro gli alberi: caratteristiche, domande, foglie e diagnostica dei test.
- La foresta gioca: riproduzione delle mosse guidate esclusivamente dal modello; distanze esatte come riferimento.

Navigazione interna con frammenti URL, mantenendo il modello in memoria. Ricaricare azzera l'allenamento. La pagina #metodo, collegata da Allena la foresta, raccoglie il ruolo di BFS e la spiegazione generale. Nel grafo resta una miniatura statica della posizione iniziale. La partita manuale si azzera lasciando la pagina iniziale.

Nessuna componente evolutiva è inclusa. BFS prepara gli esempi e verifica le distanze, ma non sceglie né corregge le mosse del modello.

