// Учебная подсказка: [2] находится левее [A].
const testClue = {
  type: "leftOf",
  left: "number-2",
  right: "letter-a",
};

// Постоянные ID элементов поля 3 × 3; порядок наборов не меняется.
const elements = [
  ["number-1", "number-2", "number-3"],
  ["letter-a", "letter-b", "letter-c"],
  ["roman-I", "roman-II", "roman-III"],
];

// Координаты элементов в постоянном каталоге: ID → { rowIndex, colIndex }.
const elementPositionById = {};

// Сгенерированный ответ: строки и колонки содержат ID элементов.
const answer = [];

// Позиции элементов в скрытом ответе: ID → { rowIndex, colIndex }.
const answerPositionById = {};

// Видимые элементы игрового поля; скрытый ответ хранится отдельно.
const visibleElements = [];



// Заполняет словарь координат элементов из постоянного каталога.
function fillElementPositionById() {
  elements.forEach((row, rowIndex) => {
    row.forEach((elementId, colIndex) => {
      elementPositionById[elementId] = { rowIndex, colIndex };
    });
  });
}

// Распределяет элементы каждой строки по случайным свободным колонкам.
function generateRandomAnswer() {
  answer.length = 0;

  elements.forEach((row, rowIndex) => {
    answer[rowIndex] = [];

    const availableColumns = row.map((_, colIndex) => colIndex);

    row.forEach((elementId) => {
      const randomIndex = Math.floor(
        Math.random() * availableColumns.length
      );

      const colIndex = availableColumns[randomIndex];

      answer[rowIndex][colIndex] = elementId;
      availableColumns.splice(randomIndex, 1);
    });
  });
}

// Заполняет словарь позиций элементов в сгенерированном ответе.
function fillAnswerPositionById() {
  answer.forEach((row, rowIndex) => {
    row.forEach((elementId, colIndex) => {
      answerPositionById[elementId] = { rowIndex, colIndex };
    });
  });
}

// Открывает все элементы, копируя правильный ответ в видимое поле.
function setAllVisibleElements() {
  answer.forEach((row, rowIndex) => {
    visibleElements[rowIndex] = [];

    row.forEach((elementId, colIndex) => {

      visibleElements[rowIndex][colIndex] = elementId;

    });
  });
}

// Проверяет, выполняется ли подсказка в скрытом ответе; ID должны существовать.
function checkClue(clue) {

  if (clue.type === "given") {
    return answerPositionById[clue.element].colIndex === clue.columnIndex;
  }

  if (clue.type === "sameColumn") {
    const topPosition = answerPositionById[clue.top];
    const bottomPosition = answerPositionById[clue.bottom];

    return (
      topPosition.colIndex === bottomPosition.colIndex &&
      topPosition.rowIndex < bottomPosition.rowIndex
    );
  }

  if (clue.type === "leftOf") {
    const leftPosition = answerPositionById[clue.left];
    const rightPosition = answerPositionById[clue.right];

    return (
      leftPosition.colIndex < rightPosition.colIndex
    );
  }

  if (clue.type === "near") {
    const side1Position = answerPositionById[clue.side1];
    const side2Position = answerPositionById[clue.side2];

    return (
      Math.abs(side1Position.colIndex - side2Position.colIndex) === 1
    );
  }

  if (clue.type === "between") {
    const side1Position = answerPositionById[clue.side1];
    const middlePosition = answerPositionById[clue.middle];
    const side2Position = answerPositionById[clue.side2];

    return (
      Math.abs(side1Position.colIndex - middlePosition.colIndex) === 1 &&
      Math.abs(side2Position.colIndex - middlePosition.colIndex) === 1 &&
      Math.abs(side1Position.colIndex - side2Position.colIndex) === 2
    );

  }

  return false;
}
// Публичные функции движка для слоя 2.

// Сбрасывает видимое поле и генерирует ответ для новой игры.
export function startGame() {
  visibleElements.length = 0; // Сбрасывает видимое поле.

  generateRandomAnswer(); // Распределяет элементы каждой строки по случайным свободным колонкам.
  fillAnswerPositionById(); // Заполняет словарь координат элементов из сгенерированного ответа.
}

// Возвращает копию постоянного каталога элементов.
export function getElements() {
  return elements.map((row) => [...row]);
}

// Возвращает независимую копию видимого поля.
export function getVisibleElements() {
  return visibleElements.map((row) => [...row]);
}

// Открывает правильный ответ при завершении игры.
export function endGame() {
  setAllVisibleElements();
}

// Инициализация
fillElementPositionById(); // Заполняет словарь координат элементов из постоянного каталога.
