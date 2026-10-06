import { moves, PEOPLE } from "./engine.js";

export function crewProblem(crew) {
  if (crew.length > 2) return "La barca ha solo due posti.";
  if (
    crew.includes(0) &&
    !crew.includes(1) &&
    crew.some((i) => i === 4 || i === 5)
  )
    return "Il padre non può viaggiare con una figlia senza la madre.";
  if (
    crew.includes(1) &&
    !crew.includes(0) &&
    crew.some((i) => i === 2 || i === 3)
  )
    return "La madre non può viaggiare con un figlio senza il padre.";
  if (crew.includes(7) && !crew.includes(6) && crew.some((i) => i < 6))
    return "Il criminale non può viaggiare con un familiare senza il poliziotto.";
  return "";
}
export function crossing(state, crew) {
  if (!crew.length) return { error: "La barca non può viaggiare vuota." };
  if (
    new Set(crew).size !== crew.length ||
    crew.some(
      (i) =>
        !Number.isInteger(i) ||
        i < 0 ||
        i >= PEOPLE.length ||
        state[i + 1] !== state[0],
    )
  )
    return { error: "Puoi imbarcare solo persone sulla sponda della barca." };
  const problem = crewProblem(crew);
  if (problem) return { error: problem };
  if (!crew.some((i) => [0, 1, 6].includes(i)))
    return { error: "Serve una guida: padre, madre o poliziotto." };
  const move = moves(state).find(
    (m) =>
      m.crew.length === crew.length && m.crew.every((i) => crew.includes(i)),
  );
  return move
    ? { state: move.target }
    : {
        error:
          "Attraversamento vietato: su una delle sponde resterebbero persone senza la supervisione richiesta. Cambia i passeggeri.",
      };
}
