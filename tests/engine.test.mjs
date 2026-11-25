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
    const side1Position = positionsById[clue.side1];
    const side2Position = positionsById[clue.side2];

    return (
      side1Position.colIndex === side2Position.colIndex &&
      side1Position.rowIndex !== side2Position.rowIndex
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
test("Размеры открытого поля getVisibleElements() соответствуют каталогу getElements()", () => {
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
test("getElements() возвращает независимую копию каталога", () => {
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

// Проверяет, что новая игра сбрасывает ранее открытое поле .
test("Новая игра сбрасывает открытое поле getVisibleElements()", () => {
  startGame();
  endGame();

  assert.ok(getVisibleElements().length > 0);

  startGame();

  assert.deepEqual(getVisibleElements(),[]);
});

// Проверяет соответствие выданных подсказок открытому ответу.
test("Выданные getClues() подсказки соответствуют открытому ответу", () => {
  startGame();
  endGame();

  const solutionPositionByID = fillPositionById(getVisibleElements());
  const clues = getClues();

  clues.forEach((clue) => {
    assert.ok(
      checkClue(clue, solutionPositionByID),
      `Подсказка ${clue.id} не соответствует открытому ответу`,
    );
  });

});

// Проверяет независимость массива подсказок и его объектов.
test("getClues() возвращает независимую копию подсказок", () => {
  startGame();

  const originalClues = getClues();
  const originalLength = originalClues.length;
  assert.ok(originalLength > 0, "Подсказки не были сгенерированы");

  const originalClueType = originalClues[0].type;
  originalClues[0].type = "test";
  originalClues.pop();

  const newClues = getClues();

  assert.equal(newClues[0].type, originalClueType, "Изменение объекта в копии затронуло подсказку внутри движка");
  assert.equal(newClues.length, originalLength, "Удаление из копии изменило количество подсказок внутри движка");

});

// Проверяет отсутствие повторных идентификаторов в выбранных подсказках.
test("getClues() Идентификаторы подсказок не повторяются", () => {
  startGame();

  const clues = getClues();
  const seenIds = new Set();

  clues.forEach((clue) => {
    assert.ok(!seenIds.has(clue.id), "Повторный ID: " + clue.id);
    seenIds.add(clue.id);
  });

});

// Проверяет наличие обоих порядков сторон в полном наборе кандидатов.
// Временно пропущен: малый случайный набор не гарантирует наличия обоих порядков участников.
// Для возврата теста нужна проверка на подготовленном наборе с управляемой случайностью.
test.skip("randomizeClueParticipants() Случайный обмен создаёт оба порядка участников", () => {
  startGame();

  const catalogPositions = fillPositionById(getElements());
  const clues = getClues();

  let symmetricCount = 0;
  let swappedCount = 0;

  clues.forEach((clue) => {
    if (
      clue.type !== "sameColumn" &&
      clue.type !== "near" &&
      clue.type !== "between"
    ) {
      return;
    }

    symmetricCount++;

    const firstPosition = catalogPositions[clue.side1];
    const secondPosition = catalogPositions[clue.side2];

    const firstIsEarlier =
      firstPosition.rowIndex < secondPosition.rowIndex ||
      (
        firstPosition.rowIndex === secondPosition.rowIndex &&
        firstPosition.colIndex < secondPosition.colIndex
      );

    if (!firstIsEarlier) {
      swappedCount++;
    }
  });

  assert.ok(symmetricCount > 1, "Недостаточно симметричных подсказок");
  assert.ok(swappedCount > 0, "Ни одна подсказка не перевёрнута");
  assert.ok(swappedCount < symmetricCount, "Перевёрнуты все симметричные подсказки",
  );
});

// Проверяет идентификаторы выданных подсказок.
test("getClues() Идентификаторы подсказок соответствуют их содержимому", () => {
  startGame();
  const elementPositionById = fillPositionById(getElements());
  const clues = getClues();

  clues.forEach((clue) => {

    if (clue.type === "given") {
      assert.equal(clue.id, clue.type + ":" + clue.element + ":" + clue.colIndex);

    } else if (clue.type === "sameColumn") {
      const side1IsEarlier =
        elementPositionById[clue.side1].rowIndex <
        elementPositionById[clue.side2].rowIndex;
      assert.equal(
        clue.id,
        clue.type + ":" +
        (side1IsEarlier ? clue.side1 : clue.side2) + ":" +
        (side1IsEarlier ? clue.side2 : clue.side1),
      );

    } else if (clue.type === "leftOf") {
      assert.equal(clue.id, clue.type + ":" + clue.left + ":" + clue.right);

    } else if (clue.type === "near") {
      const firstPosition = elementPositionById[clue.side1];
      const secondPosition = elementPositionById[clue.side2];

      const firstIsEarlier =
        firstPosition.rowIndex < secondPosition.rowIndex ||
        (
          firstPosition.rowIndex === secondPosition.rowIndex &&
          firstPosition.colIndex < secondPosition.colIndex
        );
      assert.equal(
        clue.id,
        clue.type + ":" +
        (firstIsEarlier ? clue.side1 : clue.side2) + ":" +
        (firstIsEarlier ? clue.side2 : clue.side1),
      );

    } else if (clue.type === "between") {
      const side1Position = elementPositionById[clue.side1];
      const side2Position = elementPositionById[clue.side2];

      const side1IsEarlier =
        side1Position.rowIndex < side2Position.rowIndex ||
        (
          side1Position.rowIndex === side2Position.rowIndex &&
          side1Position.colIndex < side2Position.colIndex
        );

      assert.equal(
        clue.id,
        clue.type + ":" +
        (side1IsEarlier ? clue.side1 : clue.side2) + ":" +
        clue.middle + ":" +
        (side1IsEarlier ? clue.side2 : clue.side1),
      );

    } else {
      assert.fail("Неизвестный тип подсказки: " + clue.type);
    }
  });

});
