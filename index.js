const displayDiv = document.getElementById("display");
const calculatorDiv = document.getElementById("calculator");
const historyDiv = document.getElementById("history");
const keysDiv = document.getElementById("keys");
const backDiv = document.getElementById("back");

keysDiv.classList.add('grid');
calculatorDiv.classList.add('align-end');
let lastCalculation = '';
let resetDisplay = false;
let operatorPending = false;
let historyList = [];

function append(input) {
    if (resetDisplay) {
        if (/\d/.test(input)) {
            displayDiv.value = '';
        }
        resetDisplay = false;
    }
    displayDiv.value += input;
    operatorPending = false;

    const scrollWidth = displayDiv.scrollWidth;
    historyDiv.scrollTo(scrollWidth, 0);
}

function appendOperator(operator) {
    if (operatorPending) {
        return;
    }

    if (lastCalculation && resetDisplay) {
        displayDiv.value = lastCalculation;
        resetDisplay = false;
    }

    displayDiv.value += operator;
    operatorPending = true;
}

function clearDisplay() {
    displayDiv.value = '';
    lastCalculation = '';
    resetDisplay = false;
    operatorPending = false;
}

function erase() {
    displayDiv.value = displayDiv.value.slice(0, -1);
}

function calculate() {
    try {
        const items = convertToItems(displayDiv.value);
        if (!items) throw new Error('Invalid Expression');
        
        const processedItems = processOperators(items);
        if (processedItems.length !== 1) throw new Error('Invalid Calculation');
    
        const result = processedItems[0];
        addHistory(displayDiv.value, result);

        displayDiv.value = result;
        lastCalculation = result;
        resetDisplay = true;
        operatorPending = false;
    } catch (error) {
        displayDiv.value = 'Error';
        lastCalculation = '';
        resetDisplay = true;
        operatorPending = false;
    }
}

function convertToItems(expression) {
    const items = [];
    let item = '';
    
    for (let i = 0; i < expression.length; i++) {
        const char = expression[i];
        
        if (/\d/.test(char) || char === '.') {
            item += char;
        } else if (isValidOperator(char)) {
            if (item) {
                items.push(parseFloat(item));
                item = '';
            }
            items.push(char);
        } else {
            return null;
        }
    }
    
    if (item) {
        items.push(parseFloat(item));
    }
    
    return items;
}

function isValidOperator(char) {
    return ['+', '-', '*', '/'].includes(char);
}

function processOperators(items) {
    const precedence = {
        '+': 1,
        '-': 1,
        '*': 2,
        '/': 2
    };

    const outputQueue = [];
    const operatorStack = [];

    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (typeof item === 'number') {
            outputQueue.push(item);
        } else if (isValidOperator(item)) {
            while (
                operatorStack.length &&
                precedence[operatorStack[operatorStack.length - 1]] >= precedence[item]
            ) {
                const operator = operatorStack.pop();
                const b = outputQueue.pop();
                const a = outputQueue.pop();
                outputQueue.push(executeOperator(operator, a, b));
            }
            operatorStack.push(item);
        }
    }

    while (operatorStack.length) {
        const operator = operatorStack.pop();
        const b = outputQueue.pop();
        const a = outputQueue.pop();
        outputQueue.push(executeOperator(operator, a, b));
    }

    return outputQueue;
}

function executeOperator(operator, a, b) {
    switch (operator) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return a / b;
        default: throw new Error('Invalid Operator');
    }
}

function addHistory(calculation, result) {
    const historyEntry = document.createElement('div');
    historyEntry.innerHTML = `${calculation} = ${result}`;
    historyDiv.append(historyEntry);

    const scrollHeight = historyDiv.scrollHeight;
    historyDiv.scrollTo(0, scrollHeight);
}

function showHistory() {
    calculatorDiv.classList.remove('align-end');
    calculatorDiv.classList.add('align-start');
    displayDiv.classList.add('hidden');
    keysDiv.classList.add('hidden');
    keysDiv.classList.remove('grid');
    backDiv.style.display = 'block'; 
    historyDiv.style.maxHeight = '100vh';
}

function back() {
    calculatorDiv.classList.remove('align-start');
    calculatorDiv.classList.add('align-end');
    displayDiv.classList.remove('hidden');
    keysDiv.classList.remove('hidden');
    keysDiv.classList.add('grid');
    backDiv.style.display = 'none';
    historyDiv.style.maxHeight = '100px';
}