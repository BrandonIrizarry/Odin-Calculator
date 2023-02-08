// @ts-check
"use strict";

// Single elements
const display = assertElement(document.querySelector(".entry"));
const backspaceButton = assertElement(document.querySelector("#js-backspace"));
const numberPad = document.querySelector(".area-numberpad");
const equalsButton = document.querySelector("#js-equals");
const decimalPointButton = assertElement(numberPad.querySelector(".decimal-point"));
const clearEntryButton = document.querySelector("#js-clear-entry");
const allClearButton = document.querySelector("#js-all-clear");
const arithmeticButtonDock = document.querySelector(".area-arithmetic");
const memoryButtonDock = document.querySelector(".area-memory");

// NodeLists
const allButtons = assertElementCollection(document.querySelectorAll(".button"));
const numberPadButtons = assertElementCollection(numberPad.querySelectorAll("*"));
const digitButtons = assertElementCollection(numberPad.querySelectorAll(".js-number"));
const arithmeticButtons = assertElementCollection(arithmeticButtonDock.querySelectorAll("*"));
const unaryButtons = assertElementCollection(document.querySelectorAll(".area-unary > *"));
const memoryButtons = assertElementCollection(memoryButtonDock.querySelectorAll("*"));

function initDecimalPointState () {
    let decimalPointUsed = false;

    function flagDecimalPoint () {
        decimalPointUsed = true;
    }

    function unflagDecimalPoint () {
        decimalPointUsed = false;
    }

    function getDecimalPointUsed () {
        return decimalPointUsed;
    }

    return {
        flagDecimalPoint,
        unflagDecimalPoint,
        getDecimalPointUsed,
    };
}

const decimalPointState = initDecimalPointState();

function backspaceDisplay () {
    const newText = display.textContent.slice(0, -1);

    if (newText === "") {
        display.textContent = "0";
    } else {
        display.textContent = newText;
    }
}

function clearDisplay () {
    display.textContent = "0";
}

function insertIntoDisplay (char = "", decimalPointUsed = false) {
    if (decimalPointUsed && char === ".") return;

    const currentText = display.textContent;

    if (currentText === "0") {
        display.textContent = "";
    }

    display.textContent += char;
}

// EVENT LISTENERS

const opBuffer = {
    firstOperand: null,
    operator: null,
};

function calculate (a, b = 0, operator = "") {
    const operatorTable = {
        ["+"]: (a = 0, b = 0) => a + b,
        ["-"]: (a = 0, b = 0) => a - b,
        ["*"]: (a = 0, b = 0) => a * b,
        ["/"]: (a = 0, b = 0) => {
            if (b === 0) {
                throw new RangeError("zero divisor");
            }

            return a / b;
        },

        // Unary operators
        ["√"]: (a = 0) => {
            if (a < 0) {
                throw new RangeError("can't take a negative square root");
            }

            return Math.sqrt(a);
        },
        ["±"]: (a = 0) => a * -1,
        ["%"]: (a = 0) => a / 100,
    };

    // Assign "no" the value of zero
    //
    // This should always end up being the first operand
    if (a === "no") {
        a = 0;
    }

    const fn = operatorTable[operator];

    if (!fn) {
        throw new Error(`unknown operator: ${operator}`);
    }

    let result = null;

    try {
        result = fn(a, b);
    } catch {
        result = "no";
    }

    return result;
}

function doArithmetic (currentOperator = "") {
    numberPad.addEventListener("click", () => {
        clearDisplay();
        decimalPointState.unflagDecimalPoint();
    }, { capture: true, once: true });

    const currentDisplayText = display.textContent;

    // Empty state: firstOperand and operator are null
    if (opBuffer.firstOperand == null && opBuffer.operator == null) {
        opBuffer.firstOperand = assertNotNaN(parseFloat(currentDisplayText));
        opBuffer.operator = currentOperator;
        return false;
    }

    // Result state: a result was left over from a previous
    // computation (due to '='), but there's no operator yet
    if (opBuffer.firstOperand != null && opBuffer.operator == null) {
        opBuffer.operator = currentOperator;
        return false;
    }

    // Overflow state: both firstOperand and operator are full.
    if (opBuffer.firstOperand != null && opBuffer.operator != null) {
        const secondOperand = assertNotNaN(parseFloat(currentDisplayText));
        const result = calculate(opBuffer.firstOperand, secondOperand, opBuffer.operator);

        opBuffer.firstOperand = result;
        opBuffer.operator = currentOperator;

        // Write to the display
        display.textContent = result;
        return true;
    }

    throw new Error("control flow should not reach here");
}

function doEquals () {
    numberPad.addEventListener("click", () => {
        clearDisplay();
        decimalPointState.unflagDecimalPoint();
    }, { capture: true, once: true });

    const currentDisplayText = display.textContent;

    if (opBuffer.firstOperand != null && opBuffer.operator != null) {
        const secondOperand = assertNotNaN(parseFloat(currentDisplayText));
        const result = calculate(opBuffer.firstOperand, secondOperand, opBuffer.operator);

        opBuffer.firstOperand = result;
        opBuffer.operator = null;

        // Write to the display
        display.textContent = result;

        return true;
    }

    return false;
}

// Arithmetic buttons
arithmeticButtons.forEach(arithmeticButton =>
    arithmeticButton.addEventListener("click", () => {
        const computationHappened = doArithmetic(arithmeticButton.textContent);

        if (computationHappened) {
            display.classList.add("blink");
        }
    }));

// Equals button
equalsButton.addEventListener("click", () => {
    const computationHappened = doEquals();

    if (computationHappened) {
        display.classList.add("blink");
    }
});

function insertFromNumberpad () {
    const newChar = this.textContent;
    display.classList.add("blink");

    insertIntoDisplay(newChar, decimalPointState.getDecimalPointUsed());

    if (newChar === ".") {
        decimalPointState.flagDecimalPoint();
    }
}

// All numberpad buttons
numberPadButtons.forEach(numberPadButton => numberPadButton.addEventListener("click", insertFromNumberpad));

display.addEventListener("animationend", () => {
    display.classList.remove("blink");
});

allButtons.forEach(button => button.addEventListener("animationend", function () {
    this.classList.remove("js-button-active");
}));

// Backspace button
backspaceButton.addEventListener("click", () => {
    const lastChar = display.textContent.at(-1);

    if (lastChar === ".") {
        decimalPointState.unflagDecimalPoint();
    }

    backspaceDisplay();

    display.classList.add("blink");
});

// Clear-entry button
clearEntryButton.addEventListener("click", () => {
    clearDisplay();

    decimalPointState.unflagDecimalPoint();
});

// All-clear button
allClearButton.addEventListener("click", () => {
    clearDisplay();

    decimalPointState.unflagDecimalPoint();

    opBuffer.firstOperand = null;
    opBuffer.operator = null;
});

// Unary buttons
unaryButtons.forEach(unaryButton => unaryButton.addEventListener("click", () => {
    const input = assertNotNaN(parseFloat(display.textContent));
    const unaryOperator = unaryButton.textContent;

    display.textContent = calculate(input, null, unaryOperator);
    display.classList.add("blink");
}));

const memoryCell = {
    memoryContent: 0,

    ["M+"]: function (a = 0) { this.memoryContent += a; },
    ["M-"]: function (a = 0) { this.memoryContent -= a; },
    ["M0"]: function () { this.memoryContent = 0; },
    ["MR"]: function () { return this.memoryContent; },
};

// Memory buttons
memoryButtons.forEach(memoryButton => memoryButton.addEventListener("click", () => {
    const input = assertNotNaN(parseFloat(display.textContent));
    const memoryLabel = memoryButton.textContent;
    const output = memoryCell[memoryLabel](input);

    if ((typeof output) === "number") {
        display.textContent = output;
    }
}));

// Keyboard interaction
document.addEventListener("keydown", event => {
    event.preventDefault();

    const key = event.key;
    const clickEvent = new Event("click");

    switch (key) {
    case "1": case "2": case "3": case "4": case "5":
    case "6": case "7": case "8": case "9": case "0": case ".": {
        // Hack needed to get oneshot event listener (that clears the
        // display) to apply here
        numberPad.dispatchEvent(clickEvent);
        const buttonPressed = numberPad.querySelector(`[data-index="${key}"]`);
        buttonPressed.classList.add("js-button-active");
        buttonPressed.dispatchEvent(clickEvent);
    }
        break;
    case "Backspace":
        backspaceButton.classList.add("js-button-active");
        backspaceButton.dispatchEvent(clickEvent);
        break;
    case "Escape": // all-clear
        allClearButton.classList.add("js-button-active");
        allClearButton.dispatchEvent(clickEvent);
        break;
    case "Delete": // clear-entry
        clearEntryButton.classList.add("js-button-active");
        clearEntryButton.dispatchEvent(clickEvent);
        break;
    case "+": case "-": case "*": case "/": {
        const buttonPressed = arithmeticButtonDock.querySelector(`[data-index="${key}"]`);
        buttonPressed.classList.add("js-button-active");
        buttonPressed.dispatchEvent(clickEvent);
    }
        break;
    case "=":
        equalsButton.classList.add("js-button-active");
        equalsButton.dispatchEvent(clickEvent);
        doEquals();
        break;
    case "p": case "m": case "z": case "r":
        const buttonPressed = memoryButtonDock.querySelector(`[data-index="${key}"]`);
        buttonPressed.classList.add("js-button-active");
        buttonPressed.dispatchEvent(clickEvent);
        break;
    }
});

// ASSERT-GUARD DEFINITIONS

// Ensure that a DOM element is non-null.
// If all is well, return the same element.
function assertElement (element = new Element()) {
    if (element == null) {
        throw new Error("display-element is null");
    }

    return element;
}

function assertElementCollection (collection = new NodeList()) {
    if (collection.length === 0) {
        throw new Error("empty element collection");
    }

    return collection;
}

// Ensure that a given numerical value isn't NaN.
// If all is well, return the same number.
function assertNotNaN (number = 0) {
    if (isNaN(number)) {
        throw new Error("parameter is NaN");
    }

    return number;
}
