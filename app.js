// @ts-check
"use strict";

const display = assertElement(document.querySelector(".entry"));
const decimalPointButton = assertElement(document.querySelector(".area-numberpad > .decimal-point"));
const numberButtons = assertElementCollection(document.querySelectorAll(".area-numberpad > .js-number"));
const backspaceButton = assertElement(document.querySelector("#js-backspace"));
const arithmeticButtons = assertElementCollection(document.querySelectorAll(".area-arithmetic > *"));

function initCalcState () {
    let decimalPointActive = false;

    function activateDecimalPoint () {
	decimalPointActive = true;
	decimalPointButton.classList.add("js-active");
    }

    function deactivateDecimalPoint () {
	decimalPointActive = false;
	decimalPointButton.classList.remove("js-active");
    }

    function decimalPointIsActive () {
	return decimalPointActive;
    }

    return {
	activateDecimalPoint,
	deactivateDecimalPoint,
	decimalPointIsActive,
    };
}

const calcState = initCalcState();

// Read the string occupying the display, and convert it to
// fixed-point format.
//
// Return this fixed-point-formatted object as the internal
// representation of the number.
function readValue () {
    const valueString = display.textContent;

    const radixPosition = valueString.indexOf(".");
    const length = valueString.length;

    // Remove the decimal point and convert to a simple integer
    const result = assertNotNaN(parseInt([...valueString].filter(char => char !== ".").join("")));


    switch (radixPosition) {
    case -1: // decimal point not found
	throw new Error("display entry is missing decimal point");
    case length - 1: // number is an integer
	return { result, scale: 0 };
    default:
	return { result, scale: length - radixPosition - 1 };
    }
}

// Convert the internal representation into a string, and display it.
function writeValue (fixedPointNumber = {}) {
    const { result, scale } = fixedPointNumber;

    const resultChars = [...result.toString()];
    const length = resultChars.length;

    // Insert decimal point into number to be displayed.
    //
    // If 'scale' equals 0, a decimal point will be inserted at the far-right of the number,
    // which is meant as an aesthetic touch.
    resultChars.splice(length - scale, 0, ".");

    // For numbers between 0 and 1, preserve the leading zero for
    // aesthetics
    if (result / 10 ** scale < 1 && result !== 0) {
	resultChars.splice(0, 0, "0");
    }

    display.textContent = resultChars.join("");
}

// EVENT LISTENERS

// Number buttons
numberButtons.forEach(numberButton => numberButton.addEventListener("click", () => {
    const digit = assertNotNaN(parseInt(numberButton.textContent));
    let { result, scale } = readValue();

    result = result * 10 + digit;

    if (calcState.decimalPointIsActive()) {
	scale++;
    }

    writeValue({ result, scale });
}));

// Decimal point button
decimalPointButton.addEventListener("click", calcState.activateDecimalPoint);

// Backspace button
backspaceButton.addEventListener("click", () => {
    let { result, scale } = readValue();

    // Deleting past the decimal point should deactivate it
    if (scale === 0) {
	calcState.deactivateDecimalPoint();
    }

    // Use integer division to eliminate the current ones digit
    result = Math.floor(result / 10);

    // Compensate for the lost ones digit
    scale--;

    writeValue({ result, scale });
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
