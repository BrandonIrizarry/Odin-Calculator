// @ts-check
"use strict";

// Ensure that a DOM element is non-null.
// If all is well, return the same element.
function assertElement (element = new Element()) {
    if (element == null) {
	throw new Error("display-element is null");
    }

    return element;
}

// Ensure that a given numerical value isn't NaN.
// If all is well, return the same number.
function assertNotNaN (number = 0) {
    if (isNaN(number)) {
	throw new Error("parameter is NaN");
    }

    return number;
}

const display = assertElement(document.querySelector(".entry"));

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

const numberButtons = document.querySelectorAll(".area-numberpad > .js-number");

let doScaleIncrease = false;

numberButtons.forEach(numberButton => numberButton.addEventListener("click", () => {
    const digit = assertNotNaN(parseInt(numberButton.textContent));
    let { result, scale } = readValue();

    result = result * 10 + digit;

    if (doScaleIncrease) {
	scale++;
    }

    writeValue({ result, scale });
}));

const decimalPointButton = document.querySelector(".area-numberpad > .decimal-point");

decimalPointButton.addEventListener("click", () => {
    doScaleIncrease = true;
    decimalPointButton.classList.add("js-active");
});

const backspaceButton = assertElement(document.querySelector("#js-backspace"));

backspaceButton.addEventListener("click", () => {
    let { result, scale } = readValue();

    // Use integer division to eliminate the current ones digit
    result = Math.floor(result / 10);

    // Compensate for the lost ones digit
    scale--;

    writeValue({ result, scale });
});
