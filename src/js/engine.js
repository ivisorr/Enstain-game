// Постоянный каталог ID элементов: наборы строк и их порядок не меняются.
const elements = [
  ["number-1", "number-2", "number-3", "number-4"],
  ["letter-a", "letter-b", "letter-c", "letter-d"],
  ["roman-I", "roman-II", "roman-III", "roman-IV"],
  ["domino-1", "domino-2", "domino-3", "domino-4"],
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

// Создаёт кандидата given для текущего элемента.
function generateCandidatesGiven(elementId, colIndex) {
  const clue = {
    type: "given",
    element: elementId,
    colIndex,
    id: "given:" + elementId + ":" + colIndex,
  };
  clueCandidates.given.push(clue);
}

// Создаёт sameColumn с элементами нижних строк той же колонки.
function generateCandidatesSameColumn(elementId, rowIndex, colIndex) {
  for (let bottomRowIndex = rowIndex + 1; bottomRowIndex < answer.length;  bottomRowIndex++)
  {
    const bottomElementId = answer[bottomRowIndex][colIndex];

    const clue = {
      type: "sameColumn",
      side1: elementId,
      side2: bottomElementId,
      id: "sameColumn:" + elementId + ":" + bottomElementId,
    };

    clueCandidates.sameColumn.push(clue);
  }
}

// Создаёт leftOf с элементами всех колонок правее текущей.
function generateCandidatesLeftOf(elementId, colIndex, columnCount) {
  for (let rowIndexRight = 0; rowIndexRight < answer.length;  rowIndexRight++) {
    for (  let colIndexRight = colIndex + 1; colIndexRight < columnCount;  colIndexRight++) {
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
}

// Создаёт near без зеркальных дублей, упорядочивая участников по каталогу.
function generateCandidatesNear(elementId, colIndex, columnCount) {
  const elementCatalogPosition = elementPositionById[elementId];
  for (const neighborColIndex of [colIndex - 1, colIndex + 1]) {
    // За границами поля соседней колонки нет.
    if (neighborColIndex < 0 || neighborColIndex >= columnCount) {
      continue;
    }

    for (let neighborRowIndex = 0; neighborRowIndex < answer.length; neighborRowIndex++) {
      const neighborId = answer[neighborRowIndex][neighborColIndex];
      const neighborCatalogPosition = elementPositionById[neighborId];

      // Создаём пару, если в каталоге строка соседа с большим индексом,
      // либо строки равны, но колонка соседа с большим индексом.
      const currentIsEarlier =
        elementCatalogPosition.rowIndex < neighborCatalogPosition.rowIndex ||
        (
          elementCatalogPosition.rowIndex === neighborCatalogPosition.rowIndex &&
          elementCatalogPosition.colIndex < neighborCatalogPosition.colIndex
        );

      if (!currentIsEarlier) {
        continue;
      }

      const clue = {
        type: "near",
        side1: elementId,
        side2: neighborId,
        id: "near:" + elementId + ":" + neighborId,
      };

      clueCandidates.near.push(clue);
    }
  }
}

// Создаёт between с текущим элементом в центре и нормализованными сторонами.
function generateCandidatesBetween(elementId, rowIndex, colIndex, columnCount) {
  const leftColIndex = colIndex - 1;
  const rightColIndex = colIndex + 1;
  if (leftColIndex >= 0 && rightColIndex < columnCount) {

    for (let leftRowIndex = 0; leftRowIndex < answer.length; leftRowIndex++) {
      const leftId = answer[leftRowIndex][leftColIndex];
      const leftCatalogPosition = elementPositionById[leftId];

      for (let rightRowIndex = 0; rightRowIndex < answer.length; rightRowIndex++) {
        // Исключаем тройку, в которой все элементы принадлежат одной строке.
        if (rowIndex === leftRowIndex && rowIndex === rightRowIndex) {
          continue;
        }

        const rightId = answer[rightRowIndex][rightColIndex];
        const rightCatalogPosition = elementPositionById[rightId];

        // Определяем порядок сторон в каталоге, а не в скрытом ответе.
        const leftIsEarlier =
          leftCatalogPosition.rowIndex < rightCatalogPosition.rowIndex ||
          (
            leftCatalogPosition.rowIndex === rightCatalogPosition.rowIndex &&
            leftCatalogPosition.colIndex < rightCatalogPosition.colIndex
          );

        // Сохраняем каждую допустимую пару, упорядочивая её стороны по каталогу.
        const side1Id = leftIsEarlier ? leftId : rightId;
        const side2Id = leftIsEarlier ? rightId : leftId;

        const clue = {
          type: "between",
          side1: side1Id,
          middle: elementId,
          side2: side2Id,
          id: "between:" + side1Id + ":" + elementId + ":" + side2Id,
        };

        clueCandidates.between.push(clue);
      }
    }
  }
}

// Очищает группы и формирует кандидатов пяти типов для каждого элемента.
function generateClueCandidates() {
  Object.values(clueCandidates).forEach((group) => {
    group.length = 0;
  });

  elements.forEach((row) => {
    row.forEach((elementId) => {
      const colIndex = answerPositionById[elementId].colIndex;
      const rowIndex = answerPositionById[elementId].rowIndex;
      const columnCount = row.length;

      generateCandidatesGiven(elementId, colIndex);
      generateCandidatesSameColumn(elementId, rowIndex, colIndex);
      generateCandidatesLeftOf(elementId, colIndex, columnCount);
      generateCandidatesNear(elementId, colIndex, columnCount);
      generateCandidatesBetween(elementId, rowIndex, colIndex, columnCount);
    });
  });
}

//  копирует всех кандидатов в выбранные подсказки для проверки генерации.
function selectAllClues() {
  cluesSelected.length = 0;

  Object.values(clueCandidates).forEach((group) => {
    group.forEach((clue) => {
      cluesSelected.push({ ...clue });
    });
  });
}

// Временная заглушка: завершает отбор после десяти подсказок, не проверяя решаемость.
function canSolve(clues) {
  if (clues.length > 9) {
    return true;
  }

  return false;
}

// Забирает случайного кандидата из переданного пула; возвращает подсказку или null.
function addRandomClue(candidates) {
  const groups = Object.values(candidates);
  let totalCount = 0;

  groups.forEach((group) => {
    totalCount += group.length;
  });

  if (totalCount === 0) {
    return null;
  }

  // Общий индекс даёт каждому кандидату одинаковую вероятность выбора.
  let randomIndex = Math.floor(Math.random() * totalCount);

  for (const group of groups) {
    if (randomIndex < group.length) {
      const removedClues = group.splice(randomIndex, 1);
      return removedClues[0];
    }

    randomIndex -= group.length;
  }

  return null;
}

// Временно выбирает до десяти случайных подсказок без гарантии решаемости.
function selectClues() {
  cluesSelected.length = 0;

  // selectAllClues();

  while (!canSolve(cluesSelected)) {
    const clue = addRandomClue(clueCandidates);

    if (clue === null) {
      break;
    }

    cluesSelected.push(clue);
  }
}

// Случайно меняет стороны симметричных подсказок, сохраняя их ID и центр.
function randomizeClueParticipants() {
  cluesSelected.forEach((clue) => {
    if (
      clue.type === "sameColumn"  ||
      clue.type === "near" ||
      clue.type === "between"
    ) {
      // Случайно меняем местами участников симметричных подсказок
      if (Math.random() < 0.5) {
        const temp = clue.side1;
        clue.side1 = clue.side2;
        clue.side2 = temp;
      }
    }
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

  randomizeClueParticipants(); // Случайно меняет участников симметричных подсказок.


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
