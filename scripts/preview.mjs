// node scripts/preview.mjs
import {
  startGame,
  endGame,
  getElements,
  getVisibleElements,
  getClues,
} from "../src/js/engine.js";

// Возвращает короткую подпись ID для просмотра в терминале.
function getLabel(elementId) {
  if (elementId.startsWith("number-")) {
    return elementId.slice("number-".length);
  }
  if (elementId.startsWith("letter-")) {
    return elementId.slice("letter-".length).toUpperCase();
  }
  if (elementId.startsWith("roman-")) {
    return elementId.slice("roman-".length);
  }
  if (elementId.startsWith("domino-")) {
    return "Д" + elementId.slice("domino-".length);
  }
  return elementId;
}

// Дополняет подпись пробелами до общей ширины и выделяет открытые клетки скобками.
function formatCell(label, width, isGiven = false) {
  const freeSpace = width - Array.from(label).length;
  const leftSpace = Math.floor(freeSpace / 2);
  const rightSpace = freeSpace - leftSpace;
  const content = " ".repeat(leftSpace) + label + " ".repeat(rightSpace);
  return isGiven ? "(" + content + ")" : "[" + content + "]";
}

// Форматирует подсказку тремя блоками, сохраняя порядок участников движка.
function formatClue(clue, width) {
  const cell = (elementId) => formatCell(getLabel(elementId), width);
  const sign = (text) => formatCell(text, width);

  switch (clue.type) {
    case "between":
      return cell(clue.side1) + cell(clue.middle) + cell(clue.side2);
    case "near":
      return cell(clue.side1) + sign("< >") + cell(clue.side2);
    case "leftOf":
      return cell(clue.left) + sign(">>>") + cell(clue.right);
    case "sameColumn":
      return cell(clue.side1) + sign("↑") + cell(clue.side2);
    default:
      throw new Error("Неизвестный тип подсказки: " + clue.type);
  }
}

startGame();

// Независимые снимки каталога и выбранных подсказок из публичного интерфейса движка.
const elements = getElements();
const clues = getClues();
const givenClues = clues.filter((clue) => clue.type === "given");

// Общая ширина блоков учитывает подписи элементов и знаки отношений.
const cellWidth = Math.max(
  5,
  ...elements.flat().map((elementId) => Array.from(getLabel(elementId)).length),
);

// Строка каждого ID нужна для указания координат исходно открытых клеток.
const rowById = new Map();
elements.forEach((row, rowIndex) => {
  row.forEach((elementId) => rowById.set(elementId, rowIndex));
});

// Координаты исходных открытий для выделения в матрице ответа.
const givenCells = new Set(
  givenClues.map((clue) => rowById.get(clue.element) + ":" + clue.colIndex),
);

console.log("Выбрано подсказок: " + clues.length);
console.log("\nПОДСКАЗКИ\n");

clues.forEach((clue) => {
  if (clue.type !== "given") {
    console.log(clue.type.padEnd(12) + formatClue(clue, cellWidth));
  }
});

console.log("\nОТКРЫТЫЕ ЭЛЕМЕНТЫ\n");

if (givenClues.length === 0) {
  console.log("Нет исходно открытых элементов.");
}

givenClues.forEach((clue) => {
  const rowNumber = rowById.get(clue.element) + 1;
  const columnNumber = clue.colIndex + 1;
  console.log(
    formatCell(getLabel(clue.element), cellWidth) +
    " — открыт, строка " + rowNumber + ", колонка " + columnNumber,
  );
});

// Раскрываем ответ только для этого инструмента ручного просмотра.
endGame();
const answer = getVisibleElements();

console.log("\nОТВЕТ\n");

answer.forEach((row, rowIndex) => {
  const cells = row.map((elementId, colIndex) => {
    const isGiven = givenCells.has(rowIndex + ":" + colIndex);
    return formatCell(getLabel(elementId), cellWidth, isGiven);
  });
  console.log(cells.join(""));
});

console.log("\nД — префикс условных подписей элементов строки домино.");
