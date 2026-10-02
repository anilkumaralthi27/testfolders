const display = document.getElementById("display");
let expression = "";
let justCalculated = false;

function updateDisplay(value = expression || "0") {
  display.textContent = value;
  display.animate(
    [{ transform: "scale(.98)", opacity: .75 }, { transform: "scale(1)", opacity: 1 }],
    { duration: 120, easing: "ease-out" }
  );
}

function appendValue(value) {
  if (justCalculated && /[0-9.]/.test(value)) {
    expression = "";
    justCalculated = false;
  }

  if (value === "%") {
    if (expression) expression += "/100";
    updateDisplay(expression);
    return;
  }

  if ("+-*/".includes(value)) {
    if (!expression && value !== "-") return;
    if (/[+\-*/]$/.test(expression)) {
      expression = expression.slice(0, -1) + value;
    } else {
      expression += value;
    }
  } else if (value === ".") {
    const currentNumber = expression.split(/[+\-*/]/).pop();
    if (!currentNumber.includes(".")) expression += currentNumber ? "." : "0.";
  } else {
    expression += value;
  }

  updateDisplay(expression);
}

function calculate() {
  if (!expression) return;

  try {
    if (!/^[0-9+\-*/.\s]+$/.test(expression)) throw new Error("Invalid");
    if (/[+\-*/.]$/.test(expression)) expression = expression.slice(0, -1);

    const result = Function('"use strict"; return (' + expression + ')')();
    if (!Number.isFinite(result)) throw new Error("Invalid");

    expression = String(Number(result.toFixed(10)));
    justCalculated = true;
    updateDisplay(expression);
  } catch {
    display.textContent = "Error";
    expression = "";
    justCalculated = false;
    setTimeout(() => updateDisplay(), 800);
  }
}

function clearAll() {
  expression = "";
  justCalculated = false;
  updateDisplay();
}

function deleteLast() {
  expression = expression.slice(0, -1);
  updateDisplay();
}

document.querySelector(".keys").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const value = button.dataset.value;
  const action = button.dataset.action;

  if (action === "clear") clearAll();
  else if (action === "delete") deleteLast();
  else if (action === "calculate") calculate();
  else if (value) appendValue(value);
});

document.addEventListener("keydown", (event) => {
  const key = event.key;

  if (/^[0-9.]$/.test(key)) appendValue(key);
  else if (["+", "-", "*", "/"].includes(key)) appendValue(key);
  else if (key === "%") appendValue("%");
  else if (key === "Enter" || key === "=") calculate();
  else if (key === "Backspace") deleteLast();
  else if (key === "Escape") clearAll();
});
