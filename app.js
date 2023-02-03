// @ts-check
"use strict";

// Single elements
const display = assertElement(document.querySelector(".entry"));
const backspaceButton = assertElement(document.querySelector("#js-backspace"));
const numberPad = document.querySelector(".area-numberpad");
const equalsButton = document.querySelector("#js-equals");
const decimalPointButton = assertElement(numberPad.querySelector(".decimal-point"));
const clearEntryButton = document.querySelector("#js-clear-entry");

// NodeLists
const numberPadButtons = assertElementCollection(numberPad.querySelectorAll("*"));
const digitButtons = assertElementCollection(numberPad.querySelectorAll(".js-number"));
const arithmeticButtons = assertElementCollection(document.querySelectorAll(".area-arithmetic > *"));

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

// Arithmetic buttons
arithmeticButtons.forEach(arithmeticButton => arithmeticButton.addEventListener("click", () => {
    numberPad.addEventListener("click", () => {
        editor.saveText(display.textContent, arithmeticButton.textContent);
        display.textContent = editor.clear();
    }, { capture: true, once: true });
}));

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
