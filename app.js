// @ts-check
"use strict";

// Single elements
const display = assertElement(document.querySelector(".entry"));
const decimalPointButton = assertElement(document.querySelector(".area-numberpad > .decimal-point"));
const backspaceButton = assertElement(document.querySelector("#js-backspace"));
const numberPad = document.querySelector(".area-numberpad");
const equalsButton = document.querySelector("#js-equals");

// NodeLists
const digitButtons = assertElementCollection(document.querySelectorAll(".area-numberpad > .js-number"));
const arithmeticButtons = assertElementCollection(document.querySelectorAll(".area-arithmetic > *"));

// EVENT LISTENERS

// Digit buttons
digitButtons.forEach(numberButton => numberButton.addEventListener("click", () => {
    display.textContent += numberButton.textContent;
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
