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

// Return a value consisting of an integer, and a scale factor, such
// that the intended number is N = I / 10 ** S
function toFixedPoint (valueString = "") {
    const radixPosition = valueString.indexOf(".");
    const length = valueString.length;
    const result = [...valueString].filter(char => char !== ".").join("");

    switch (radixPosition) {
    case -1:
	throw new Error("display entry is missing decimal point");
    case length - 1:
	return { result, scale: 0 };
    default:
	return { result, scale: length - radixPosition - 1 };
    }
}
