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

// NodeLists
const numberPadButtons = assertElementCollection(numberPad.querySelectorAll("*"));
const digitButtons = assertElementCollection(numberPad.querySelectorAll(".js-number"));
const arithmeticButtons = assertElementCollection(document.querySelectorAll(".area-arithmetic > *"));
const unaryButtons = assertElementCollection(document.querySelectorAll(".area-unary > *"));
const memoryButtons = assertElementCollection(document.querySelectorAll(".area-memory > *"));

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
    display.textContent = newText;
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


const operatorTable = {
    ["+"]: (a = 0, b = 0) => a + b,
    ["-"]: (a = 0, b = 0) => a - b,
    ["*"]: (a = 0, b = 0) => a * b,
    ["/"]: (a = 0, b = 0) => {
        if (b === 0) {
            throw new RangeError("zero divisor");
        }

        return a / b;
    }
};

// TODO: catch zero divisor
function calculate (a = 0, b = 0, operator = "") {
    const fn = operatorTable[operator];

    if (!fn) {
        throw new Error(`unknown operator: ${operator}`);
    }

    return fn(a, b);
}

function doArithmetic (currentOperator = "") {
    numberPad.addEventListener("click", () => {
        clearDisplay();
        decimalPointState.unflagDecimalPoint();
    }, { capture: true, once: true });

    const currentDisplayText = display.textContent;

    // Empty state: firstOperand and operator are null
    if (opBuffer.firstOperand == null && opBuffer.operator == null) {
        opBuffer.firstOperand = assertNotNaN(parseInt(currentDisplayText));
        opBuffer.operator = currentOperator;
        return;
    }

    // Result state: a result was left over from a previous
    // computation (due to '='), but there's no operator yet
    if (opBuffer.firstOperand != null && opBuffer.operator == null) {
        opBuffer.operator = currentOperator;
        return;
    }

    // Overflow state: both firstOperand and operator are full.
    if (opBuffer.firstOperand != null && opBuffer.operator != null) {
        const secondOperand = assertNotNaN(parseInt(currentDisplayText));
        const result = calculate(opBuffer.firstOperand, secondOperand, opBuffer.operator);

        opBuffer.firstOperand = result;
        opBuffer.operator = currentOperator;

        // Write to the display
        display.textContent = result;
        return;
    }
}

// Arithmetic buttons
arithmeticButtons.forEach(arithmeticButton =>
    arithmeticButton.addEventListener("click", () => {
        doArithmetic(arithmeticButton.textContent);
    }));

function insertFromNumberpad (newChar = "0") {
    insertIntoDisplay(newChar, decimalPointState.getDecimalPointUsed());

    if (newChar === ".") {
        decimalPointState.flagDecimalPoint();
    }
}

// All numberpad buttons
numberPadButtons.forEach(numberPadButton => numberPadButton.addEventListener("click", () =>
    insertFromNumberpad(numberPadButton.textContent)));

// Backspace button
backspaceButton.addEventListener("click", () => {
    const lastChar = display.textContent.at(-1);

    if (lastChar === ".") {
        decimalPointState.unflagDecimalPoint();
    }

    backspaceDisplay();
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

    // TODO: clear any buffers used for arithmetic operations
});

const unaryOperatorTable = {
    ["√"]: (a = 0) => {
        if (a < 0) {
            throw new RangeError("can't take a negative square root");
        }

        return Math.sqrt(a);
    },
    ["±"]: (a = 0) => a * -1,
    ["%"]: (a = 0) => a / 100,
};

// Unary buttons
unaryButtons.forEach(unaryButton => unaryButton.addEventListener("click", () => {
    const input = assertNotNaN(parseFloat(display.textContent));
    const unaryOperator = unaryButton.textContent;

    display.textContent = unaryOperatorTable[unaryOperator](input);
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

    if (output) {
        display.textContent = output;
    }
}));

// Keyboard interaction
document.addEventListener("keydown", event => {
    event.preventDefault();

    const key = event.key;
    const clickEvent = new Event("click");

    // Handle numberpad
    const numberpad = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "."];

    if (numberpad.includes(key)) {
        // Hack needed to get oneshot event listener (that clears the
        // display) to apply here
        numberPad.dispatchEvent(clickEvent);

        insertFromNumberpad(key);
    }

    // Handle backspace
    if (key === "Backspace") {
        backspaceButton.dispatchEvent(clickEvent);
    }

    // Handle all clear
    if (key === "Delete") {
        allClearButton.dispatchEvent(clickEvent);
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
