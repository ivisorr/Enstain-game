import test from "node:test";
import assert from "node:assert/strict";
import {
  startGame,
  endGame,
  getElements,
  getVisibleElements,
} from "../src/js/engine.js";

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
