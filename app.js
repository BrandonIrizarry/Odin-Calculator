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

const display = document.querySelector(".entry");

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
    const result = parseInt([...valueString].filter(char => char !== ".").join(""));


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

    display.textContent = (result / 10 ** scale).toString();
}
