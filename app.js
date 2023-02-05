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

function initEditor () {
    let decimalPointUsed = false;
    let internalBuffer = [];

    function insert (buffer = "", char = "") {
        if (decimalPointUsed && char === ".") return buffer;

        buffer += char;

        return buffer;
    }

    function backspace (buffer = "") {
        return buffer.slice(0, -1);
    }

    function flagDecimalPoint () {
        decimalPointUsed = true;
    }

    function unflagDecimalPoint () {
        decimalPointUsed = false;
    }

    function clear () {
        return "";
    }

    function saveText (...textTokens) {
        internalBuffer = internalBuffer.concat(textTokens);
    }

    function clearInternalBuffer () {
        internalBuffer = [];
    }

    function getSavedText () {
        return internalBuffer;
    }

    return {
        insert,
        flagDecimalPoint,
        unflagDecimalPoint,
        backspace,
        clear,
        saveText,
        getSavedText,
        clearInternalBuffer,
    };
}

const editor = initEditor();

// EVENT LISTENERS

// All numberpad buttons
numberPadButtons.forEach(numberPadButton => numberPadButton.addEventListener("click", () => {
    const newChar = numberPadButton.textContent;

    display.textContent = editor.insert(display.textContent, numberPadButton.textContent);

    if (newChar === ".") {
        editor.flagDecimalPoint();
    }
}));

// Backspace button
backspaceButton.addEventListener("click", () => {
    const deletedChar = display.textContent.at(-1);

    if (deletedChar === ".") {
        editor.unflagDecimalPoint();
    }

    display.textContent = editor.backspace(display.textContent);
});

// Clear-entry button
clearEntryButton.addEventListener("click", () => {
    display.textContent = editor.clear();

    editor.unflagDecimalPoint();
});

// All-clear button
allClearButton.addEventListener("click", () => {
    display.textContent = editor.clear();

    editor.unflagDecimalPoint();
    editor.clearInternalBuffer();
});

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

function flushArithmetic (currentOperator = "") {
    const [ firstOperand, operator ] = editor.getSavedText();

    // Flush the editor buffer, producing and displaying a result with
    // the current display entry and buffered firstOperand and
    // operator
    if (firstOperand && operator) {
        const num1 = assertNotNaN(parseFloat(firstOperand));
        const num2 = assertNotNaN(parseFloat(display.textContent));
        const result =  operatorTable[operator](num1, num2);
        display.textContent = result;
        editor.clearInternalBuffer();
        editor.saveText(result.toString());
    }

    numberPad.addEventListener("click", () => {
        display.textContent = editor.clear();
        editor.unflagDecimalPoint();
    }, { capture: true, once: true });

    const operand = display.textContent;

    if (!firstOperand) {
        editor.saveText(operand);
    }

    editor.saveText(currentOperator);
}

// Arithmetic buttons
arithmeticButtons.forEach(arithmeticButton =>
    arithmeticButton.addEventListener("click",() =>
        flushArithmetic(arithmeticButton.textContent)));

// Equals button
equalsButton.addEventListener("click", () => {
    const [ firstOperand, operator ] = editor.getSavedText();

    if (firstOperand && operator) {
        const num1 = assertNotNaN(parseFloat(firstOperand));
        const num2 = assertNotNaN(parseFloat(display.textContent));
        const result = operatorTable[operator](num1, num2);
        display.textContent = result;
        editor.clearInternalBuffer();
        editor.saveText(result.toString());
    }

    numberPad.addEventListener("click", () => {
        display.textContent = editor.clear();
        editor.unflagDecimalPoint();
    }, { capture: true, once: true });
});

const unaryOperatorTable = {
    ["√"]: (a = 0) => Math.sqrt(a),
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
    const arithmetic = ["-", "*", "+", "/"];

    if (arithmetic.includes(key)) {
        flushArithmetic(key);
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
