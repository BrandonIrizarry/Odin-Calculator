// @ts-check
"use strict";

// Single elements
const display = assertElement(document.querySelector(".entry"));
const backspaceButton = assertElement(document.querySelector("#js-backspace"));
const numberPad = document.querySelector(".area-numberpad");
const equalsButton = document.querySelector("#js-equals");
const decimalPointButton = assertElement(numberPad.querySelector(".decimal-point"));

// NodeLists
const numberPadButtons = assertElementCollection(numberPad.querySelectorAll("*"));
const digitButtons = assertElementCollection(numberPad.querySelectorAll(".js-number"));
const arithmeticButtons = assertElementCollection(document.querySelectorAll(".area-arithmetic > *"));

// EVENT LISTENERS

// All numberpad buttons
numberPadButtons.forEach(numberPadButton => numberPadButton.addEventListener("click", () => {
    display.textContent += numberPadButton.textContent;
}));

// Backspace button
backspaceButton.addEventListener("click", () => {
    display.textContent = display.textContent.slice(0, -1);
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
