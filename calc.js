/* DOM-элементы (ссылки на элементы страницы) */
const mainDisplay = document.getElementById('mainDisplay');
const secondaryDisplay = document.getElementById('secondaryDisplay');
const buttons = document.querySelector('.buttons-grid');

/* Состояние калькулятора (явные имена) */
const state = {
  left: '',        // левый операнд как строка
  right: '',       // правый операнд как строка (ввод второго числа)
  operator: null   // текущий оператор: '+', '-', '*', '/'
};

/* Инициализация отображения */
updateDisplay();

/* Обработчики событий (делегирование кликов по кнопкам) */
buttons.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;

  if ('number' in btn.dataset) {
    handleNumber(btn.dataset.number);
    return;
  }

  if ('operator' in btn.dataset) {
    handleOperator(btn.dataset.operator);
    return;
  }

  if (btn.dataset.action === 'equals') {
    handleEquals();
    return;
  }

  if (btn.dataset.action === 'clear') {
    clearAll();
    return;
  }

  if (btn.dataset.action === 'decimal') {
    handleDecimal();
    return;
  }

  if (btn.dataset.action === 'toggleSign') {
    handleToggleSign();
    return;
  }
});

/* Вспомогательные чистые функции (без сайд-эффектов) */
function toNumber(str) {
  const n = Number(str);
  return Number.isFinite(n) ? n : 0;
}

function calculateValues(aStr, bStr, op) {
  const a = toNumber(aStr);
  const b = toNumber(bStr);
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return b === 0 ? NaN : a / b;
    default: return NaN;
  }
}

function displayOperator(op) {
  return { '+': '+', '-': '−', '*': '×', '/': '÷' }[op] || '';
}

/* Обработчики действий пользователя:
   ввод цифр, десятичной точки, смена знака, выбор оператора, = и очистка */
function handleNumber(num) {
  // если нет оператора — в левый операнд, иначе — во второй
  if (!state.operator) {
    // предотвратить ведущие нули: "0" -> ввод "0" не добавит лишних нулей
    if (state.left === '0') state.left = num;
    else state.left += num;
  } else {
    if (state.right === '0') state.right = num;
    else state.right += num;
    updateLiveResult(); // при вводе второго числа показываем live результат
  }
  updateDisplay();
}

function handleDecimal() {
  if (!state.operator) {
    if (!state.left.includes('.')) state.left = state.left === '' ? '0.' : state.left + '.';
  } else {
    if (!state.right.includes('.')) state.right = state.right === '' ? '0.' : state.right + '.';
    updateLiveResult();
  }
  updateDisplay();
}

function handleToggleSign() {
  if (!state.operator) {
    state.left = state.left.startsWith('-') ? state.left.slice(1) : '-' + (state.left || '0');
  } else {
    state.right = state.right.startsWith('-') ? state.right.slice(1) : '-' + (state.right || '0');
    updateLiveResult();
  }
  updateDisplay();
}

function handleOperator(opSymbol) {
  // мапинг UI символов (÷, ×, −) на внутренние JS операторы
  const map = { '+': '+', '−': '-', '×': '*', '÷': '/' };
  const op = map[opSymbol] || opSymbol;

  // если уже есть left & operator & right -> вычисляем промежуточно (left = left op right)
  if (state.left && state.operator && state.right) {
    const res = calculateValues(state.left, state.right, state.operator);
    state.left = String(Number.isFinite(res) ? res : 0);
    state.right = '';
  }

  // ставим новый оператор (заменит предыдущий, если нажали подряд)
  state.operator = op;
  updateDisplay();
}

function handleEquals() {
  // нужно иметь left, operator и right
  if (!state.left || !state.operator || !state.right) return;

  const res = calculateValues(state.left, state.right, state.operator);

  // показать результат в левом поле, очистить правое и оператор
  state.left = String(Number.isFinite(res) ? res : 0);
  state.right = '';
  state.operator = null;

  // сбрасываем верхний (live) экран
  secondaryDisplay.textContent = '';
  updateDisplay();
}

function clearAll() {
  state.left = '';
  state.right = '';
  state.operator = null;
  secondaryDisplay.textContent = '';
  updateDisplay();
}

/* Живой результат:
   при вводе второго числа вычисляем и показываем промежуточный результат */
function updateLiveResult() {
  if (!state.left || !state.operator || !state.right) {
    secondaryDisplay.textContent = '';
    return;
  }
  const res = calculateValues(state.left, state.right, state.operator);
  secondaryDisplay.textContent = Number.isFinite(res) ? String(res) : 'Ошибка';
}

/* Обновление отображения (mainDisplay — текущее выражение, secondaryDisplay — live/результат) */
function updateDisplay() {
  // main показывает текущее выражение (например "12+5")
  mainDisplay.textContent = (state.left || '0') + (state.operator ? displayOperator(state.operator) : '') + (state.right || '');
}
