// Постоянные ID элементов учебного поля 3 × 3; порядок наборов не меняется.
const elements = [
  ["number-1", "number-2", "number-3"],
  ["letter-a", "letter-b", "letter-c"],
  ["roman-I", "roman-II", "roman-III"],
];

// Координаты элементов в постоянном каталоге: ID → { rowIndex, colIndex }.
const elementIndexById = {};

// Заполняет словарь координат элементов из постоянного каталога.
function fillElementIndexById() {
  elements.forEach((row, rowIndex) => {
    row.forEach((elementId, colIndex) => {
      elementIndexById[elementId] = { rowIndex, colIndex };
    });
  });
}

fillElementIndexById();
