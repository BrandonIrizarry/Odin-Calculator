// @ts-check
"use strict";

// Single elements
const display = assertElement(document.querySelector(".entry"));
const decimalPointButton = assertElement(document.querySelector(".area-numberpad > .decimal-point"));
const backspaceButton = assertElement(document.querySelector("#js-backspace"));
const numberPad = document.querySelector(".area-numberpad");
const equalsButton = document.querySelector("#js-equals");

// NodeLists
const numberButtons = assertElementCollection(document.querySelectorAll(".area-numberpad > .js-number"));
const arithmeticButtons = assertElementCollection(document.querySelectorAll(".area-arithmetic > *"));

// Special value representing zero
const zeroValue = { result: 0, scale: 0 };

function initDecimalPointState () {
    let decimalPointActive = false;

    function activate () {
	decimalPointActive = true;
	decimalPointButton.classList.add("js-active");
    }

    function deactivate () {
	decimalPointActive = false;
	decimalPointButton.classList.remove("js-active");
    }

    function isActive () {
	return decimalPointActive;
    }

    return {
	activate,
	deactivate,
	isActive,
    };
}

const decimalPointState = initDecimalPointState();

// Read the string occupying the display, and convert it to
// fixed-point format.
//
// Return this fixed-point-formatted object as the internal
// representation of the number.
function readValue (valueString = display.textContent) {
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

    if (decimalPointState.isActive()) {
	scale++;
    }

    writeValue({ result, scale });
}));

// Decimal point button
decimalPointButton.addEventListener("click", decimalPointState.activate);

// Backspace button
backspaceButton.addEventListener("click", () => {
    let { result, scale } = readValue();

    // Deleting past the decimal point should deactivate it
    if (scale === 0) {
	decimalPointState.deactivate();
    }

    // Use integer division to eliminate the current ones digit
    result = Math.floor(result / 10);

    // Compensate for the lost ones digit
    scale--;

    writeValue({ result, scale });
});

const opBuffer = {
    firstOperand: null,
    operation: null
};

arithmeticButtons.forEach(arithmeticButton => arithmeticButton.addEventListener("click", () => {
    const currentOperation = arithmeticButton.textContent;

    if (Boolean(opBuffer.firstOperand)) {
	const secondOperand = readValue();
	const rawResult = operate(opBuffer.firstOperand, secondOperand, opBuffer.operation);
	let stringResult = rawResult.toString();

	// Make stringResult compatible as input for 'readValue'
	if (rawResult === Math.floor(rawResult)) {
	    stringResult += ".";
	}

	writeValue(readValue(stringResult));
    }

    opBuffer.firstOperand = readValue();
    opBuffer.operation = currentOperation;

    numberPad.addEventListener("click", function () {
	writeValue(zeroValue);
	decimalPointState.deactivate();
    }, { capture: true, once: true });

}));

equalsButton.addEventListener("click", () => {
    if (Boolean(opBuffer.firstOperand)) {
	const secondOperand = readValue();
	const rawResult = operate(opBuffer.firstOperand, secondOperand, opBuffer.operation);
	let stringResult = rawResult.toString();

	// Make stringResult compatible as input for 'readValue'
	if (rawResult === Math.floor(rawResult)) {
	    stringResult += ".";
	}

	writeValue(readValue(stringResult));

	// Reset the opBuffer
	opBuffer.firstOperand = null;
	opBuffer.operation = null;

	numberPad.addEventListener("click", function () {
	    writeValue(zeroValue);
	    decimalPointState.deactivate();
	}, { capture: true, once: true });
    }
});


// THE 'OPERATE' FUNCTION

function operate ({ result: result1, scale: scale1 }, { result: result2, scale: scale2 }, operation = "") {
    const num1 = result1 / 10 ** scale1;
    const num2 = result2 / 10 ** scale2;

    switch (operation) {
    case "+":
	return num1 + num2;
    case "-":
	return num1 - num2;
    case "*":
	return num1 * num2;
    case "/":
	if (num2 === 0) throw new Error("zero divisor");
	return num1 / num2;
    default:
	throw new Error(`unknown operation: ${operation}`);
    }
}

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
