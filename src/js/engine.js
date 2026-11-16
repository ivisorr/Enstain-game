// Постоянные ID элементов поля 3 × 3; порядок наборов не меняется.
const elements = [
  ["number-1", "number-2", "number-3"],
  ["letter-a", "letter-b", "letter-c"],
  ["roman-I", "roman-II", "roman-III"],
];

// Координаты элементов в постоянном каталоге: ID → { rowIndex, colIndex }.
const elementIndexById = {};

// Сгенерированный ответ: строки и колонки содержат ID элементов.
const answer = [];

// Видимые элементы игрового поля; скрытый ответ хранится отдельно.
const visibleElements = [];



// Заполняет словарь координат элементов из постоянного каталога.
function fillElementIndexById() {
  elements.forEach((row, rowIndex) => {
    row.forEach((elementId, colIndex) => {
      elementIndexById[elementId] = { rowIndex, colIndex };
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

// Открывает все элементы, копируя правильный ответ в видимое поле.
function setAllVisibleElements() {
  answer.forEach((row, rowIndex) => {
    visibleElements[rowIndex] = [];

    row.forEach((elementId, colIndex) => {

      visibleElements[rowIndex][colIndex] = elementId;
    
    });
  });
}


// Публичные функции движка для слоя 2.

// Сбрасывает видимое поле и генерирует ответ для новой игры.
export function startGame() {
  visibleElements.length = 0; // Сбрасывает видимое поле.

  generateRandomAnswer(); // Распределяет элементы каждой строки по случайным свободным колонкам.
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
fillElementIndexById(); // Заполняет словарь координат элементов из постоянного каталога.
