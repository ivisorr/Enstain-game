import test from "node:test";
import assert from "node:assert/strict";
import {
  startGame,
  endGame,
  getElements,
  getVisibleElements,
  getClues,
} from "../src/js/engine.js";

// Вспомогательные функции для тестов.

// Создаёт словарь позиций ID по переданной матрице.
function fillPositionById(sourceMatrix) {
  const positionsById = {};

  sourceMatrix.forEach((row, rowIndex) => {
    row.forEach((elementId, colIndex) => {
      positionsById[elementId] = { rowIndex, colIndex };
    });
  });

  return positionsById;
}

// Проверяет подсказку по позициям элементов открытого поля.
function checkClue(clue, positionsById) {

  if (clue.type === "given") {
    return positionsById[clue.element].colIndex === clue.colIndex;
  }

  if (clue.type === "sameColumn") {
    const topPosition = positionsById[clue.top];
    const bottomPosition = positionsById[clue.bottom];

    return (
      topPosition.colIndex === bottomPosition.colIndex &&
      topPosition.rowIndex < bottomPosition.rowIndex
    );
  }

  if (clue.type === "leftOf") {
    const leftPosition = positionsById[clue.left];
    const rightPosition = positionsById[clue.right];

    return (
      leftPosition.colIndex < rightPosition.colIndex
    );
  }

  if (clue.type === "near") {
    const side1Position = positionsById[clue.side1];
    const side2Position = positionsById[clue.side2];

    return (
      Math.abs(side1Position.colIndex - side2Position.colIndex) === 1
    );
  }

  if (clue.type === "between") {
    const side1Position = positionsById[clue.side1];
    const middlePosition = positionsById[clue.middle];
    const side2Position = positionsById[clue.side2];

    return (
      Math.abs(side1Position.colIndex - middlePosition.colIndex) === 1 &&
      Math.abs(side2Position.colIndex - middlePosition.colIndex) === 1 &&
      Math.abs(side1Position.colIndex - side2Position.colIndex) === 2
    );

  }

  return false;
}

// Проверяет соответствие размеров открытого поля и постоянного каталога.
test("Размеры открытого поля соответствуют каталогу", () => {
  startGame();
  endGame();

  const elements = getElements();
  const visibleElements = getVisibleElements();

  assert.equal(visibleElements.length, elements.length);

  visibleElements.forEach((row, rowIndex) => {
    assert.equal(row.length, elements[rowIndex].length);
  });
});

// Проверяет состав строк открытого поля: без пропусков, повторов и чужих ID.
test("Состав строк открытого поля соответствует каталогу", () => {
  startGame();
  endGame();

  const elements = getElements();
  const visibleElements = getVisibleElements();

  assert.equal(visibleElements.length, elements.length);

  visibleElements.forEach((row, rowIndex) => {
    assert.deepEqual(
      [...row].sort(),
      [...elements[rowIndex]].sort(),
    );
  });
});

// Проверяет, что изменение копии каталога не меняет данные движка.
test("getElements возвращает независимую копию каталога", () => {
  startGame();
  endGame();

  const elementsOld = getElements();
  const originalId = elementsOld[1][1];
  elementsOld[1][1] = "test"; // Изменяем значение в копии постоянного каталога

  const elementsNew = getElements();

  assert.equal(elementsNew[1][1], originalId);
});

// Проверяет, что изменение копии видимого поля не меняет данные движка.
test("getVisibleElements возвращает независимую копию поля", () => {
  startGame();
  endGame();

  const visibleElementsOld = getVisibleElements();
  const originalId = visibleElementsOld[1][1];
  visibleElementsOld[1][1] = "test"; // Изменяем значение в копии видимого поля

  const visibleElementsNew = getVisibleElements();

  assert.equal(visibleElementsNew[1][1], originalId);
});

// Проверяет, что новая игра сбрасывает ранее открытое поле.
test("Новая игра сбрасывает открытое поле", () => {
  startGame();
  endGame();

  assert.ok(getVisibleElements().length > 0);

  startGame();

  assert.deepEqual(getVisibleElements(),[]);
});

// Проверяет соответствие выданных подсказок открытому ответу.
test("Выданные подсказки соответствуют открытому ответу", () => {
  startGame();
  endGame();

  const solutionPositionByID = fillPositionById( getVisibleElements() );
  const clues = getClues();

  clues.forEach((clue) => {
    assert.ok(checkClue(clue, solutionPositionByID),
    `Подсказка для элемента ${clue.element}
    не соответствует позиции в открытом поле`);
  });

  // assert.deepEqual(getVisibleElements(),[]);
});
