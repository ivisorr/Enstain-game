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

// Доступные кандидаты подсказок, сгруппированные по типам.
const clueCandidates = {
  given: [],
  sameColumn: [],
  leftOf: [],
  near: [],
  between: [],
};

// Выбранные подсказки текущей головоломки.
const cluesSelected = [];



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

// Формирует кандидатов given, sameColumn и leftOf по сгенерированному ответу.
function generateClueCandidates() {
   // Сбрасывает массивы всех подсказок.
  Object.values(clueCandidates).forEach((group) => {
    group.length = 0;
  });

  // Генерация подсказок для каждого элемента в сгенерированном ответе.
  elements.forEach((row) => {
    row.forEach((elementId) => {

      const colIndex = answerPositionById[elementId].colIndex;
      const rowIndex = answerPositionById[elementId].rowIndex;

      // Кандидат given: открытый элемент в указанной колонке.
      const clue = {
        type: "given",
        element: elementId,
        colIndex,
        id: "given:" + elementId + ":" + colIndex,
      };
      clueCandidates.given.push(clue);

      // sameColumn кандидаты - элементы в том же столбце.
      for (  let bottomRowIndex = rowIndex + 1; bottomRowIndex < answer.length;  bottomRowIndex++)
      {
        const bottomElementId = answer[bottomRowIndex][colIndex];
        const clue = {
          type: "sameColumn",
          top: elementId,
          bottom: bottomElementId,
          id: "sameColumn:" + elementId + ":" + bottomElementId,
        };
        clueCandidates.sameColumn.push(clue);
      }

      // Кандидаты leftOf: элементы в колонках правее текущей, не обязательно соседних.
      for (  let rowIndexRight = 0; rowIndexRight < answer.length;  rowIndexRight++) {
        for (  let colIndexRight = colIndex + 1; colIndexRight < row.length;  colIndexRight++) {
          const elementIdRight = answer[rowIndexRight][colIndexRight];
          const clue = {
            type: "leftOf",
            left: elementId,
            right: elementIdRight,
            id: "leftOf:" + elementId + ":" + elementIdRight,
          };
          clueCandidates.leftOf.push(clue);
        }
      }

    });
  });
}

// Временно копирует всех кандидатов в выбранные подсказки для проверки генерации.
function selectClues() {
  cluesSelected.length = 0;

  Object.values(clueCandidates).forEach((group) => {
    group.forEach((clue) => {
      cluesSelected.push({ ...clue });
    });
  });
}



// Публичные функции движка.

// Сбрасывает видимое поле и генерирует ответ для новой игры.
export function startGame() {
  visibleElements.length = 0; // Сбрасывает видимое поле.

  generateRandomAnswer(); // Распределяет элементы каждой строки по случайным свободным колонкам.
  fillAnswerPositionById(); // Заполняет словарь координат элементов из сгенерированного ответа.
  generateClueCandidates(); // Формирует кандидатов по новому ответу.
  selectClues(); // Выбирает подсказки для отображения.
}

// Возвращает копию постоянного каталога элементов.
export function getElements() {
  return elements.map((row) => [...row]);
}

// Возвращает независимую копию видимого поля.
export function getVisibleElements() {
  return visibleElements.map((row) => [...row]);
}

// Возвращает выбранные подсказки для отображения.
export function getClues() {
  return cluesSelected.map((clue) => ({...clue}));
}


// Открывает правильный ответ при завершении игры.
export function endGame() {
  setAllVisibleElements();
}

// Инициализация
fillElementPositionById(); // Заполняет словарь координат элементов из постоянного каталога.
