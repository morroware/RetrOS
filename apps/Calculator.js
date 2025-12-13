/**
 * Calculator App (Pixel Perfect Fix)
 * Fixed dimensions to prevent scrollbars
 */

import AppBase from './AppBase.js';

class Calculator extends AppBase {
    constructor() {
        super({
            id: 'calculator',
            name: 'Calculator',
            icon: '🔢',
            // EXACT DIMENSIONS to fit the CSS grid perfectly
            width: 250, 
            height: 285, 
            resizable: false // Disable resizing to maintain the layout integrity
        });

        this.displayValue = '0';
        this.firstOperand = null;
        this.waitingForSecondOperand = false;
        this.operator = null;
    }

    onOpen() {
        return `
            <div class="calculator">
                <div class="calc-display inset-border" id="display">0</div>
                
                <div class="calc-buttons">
                    <button class="calc-btn btn-danger" data-action="clear">C</button>
                    <button class="calc-btn" data-action="operator" data-op="/">÷</button>
                    <button class="calc-btn" data-action="operator" data-op="*">×</button>
                    <button class="calc-btn" data-action="operator" data-op="-">-</button>

                    <button class="calc-btn" data-num="7">7</button>
                    <button class="calc-btn" data-num="8">8</button>
                    <button class="calc-btn" data-num="9">9</button>
                    <button class="calc-btn" data-action="operator" data-op="+">+</button>

                    <button class="calc-btn" data-num="4">4</button>
                    <button class="calc-btn" data-num="5">5</button>
                    <button class="calc-btn" data-num="6">6</button>
                    
                    <button class="calc-btn calc-btn-equal" data-action="equal">=</button>

                    <button class="calc-btn" data-num="1">1</button>
                    <button class="calc-btn" data-num="2">2</button>
                    <button class="calc-btn" data-num="3">3</button>

                    <button class="calc-btn calc-btn-zero" data-num="0">0</button>
                    <button class="calc-btn" data-action="decimal">.</button>
                </div>
            </div>
        `;
    }

    onMount() {
        const buttonsContainer = this.getElement('.calc-buttons');
        
        // Event Delegation
        this.addHandler(buttonsContainer, 'click', (e) => {
            const target = e.target.closest('button'); 
            if (!target) return;

            target.blur(); // Remove focus so "Enter" doesn't re-trigger click

            if (target.dataset.num) {
                this.inputDigit(target.dataset.num);
            } else if (target.dataset.action === 'decimal') {
                this.inputDecimal();
            } else if (target.dataset.action === 'operator') {
                this.handleOperator(target.dataset.op);
            } else if (target.dataset.action === 'equal') {
                this.handleEqual();
            } else if (target.dataset.action === 'clear') {
                this.resetCalculator();
            }
            this.updateDisplay();
        });

        this.addHandler(document, 'keydown', (e) => this.handleKeyboard(e));
    }

    // --- Logic ---

    inputDigit(digit) {
        if (this.waitingForSecondOperand) {
            this.displayValue = digit;
            this.waitingForSecondOperand = false;
        } else {
            this.displayValue = this.displayValue === '0' ? digit : this.displayValue + digit;
        }
    }

    inputDecimal() {
        if (this.waitingForSecondOperand) {
            this.displayValue = '0.';
            this.waitingForSecondOperand = false;
            return;
        }
        if (!this.displayValue.includes('.')) {
            this.displayValue += '.';
        }
    }

    handleOperator(nextOperator) {
        const inputValue = parseFloat(this.displayValue);

        if (this.operator && this.waitingForSecondOperand) {
            this.operator = nextOperator;
            return;
        }

        if (this.firstOperand === null) {
            this.firstOperand = inputValue;
        } else if (this.operator) {
            const result = this.calculate(this.firstOperand, inputValue, this.operator);
            this.displayValue = String(parseFloat(result.toFixed(7)));
            this.firstOperand = result;
        }

        this.waitingForSecondOperand = true;
        this.operator = nextOperator;
    }

    handleEqual() {
        if (!this.operator || this.firstOperand === null) return;
        const inputValue = parseFloat(this.displayValue);
        const result = this.calculate(this.firstOperand, inputValue, this.operator);
        
        this.displayValue = String(parseFloat(result.toFixed(7)));
        this.firstOperand = null;
        this.operator = null;
        this.waitingForSecondOperand = true;
    }

    calculate(first, second, operator) {
        if (operator === '+') return first + second;
        if (operator === '-') return first - second;
        if (operator === '*') return first * second;
        if (operator === '/') return first / second;
        return second;
    }

    resetCalculator() {
        this.displayValue = '0';
        this.firstOperand = null;
        this.waitingForSecondOperand = false;
        this.operator = null;
    }

    updateDisplay() {
        const display = this.getElement('#display');
        if (display) display.textContent = this.displayValue;
    }

    handleKeyboard(e) {
        if (!this.getElement('.calculator')) return;
        const key = e.key;
        if (/[0-9]/.test(key)) this.inputDigit(key);
        else if (key === '.') this.inputDecimal();
        else if (['+', '-', '*', '/'].includes(key)) this.handleOperator(key);
        else if (key === 'Enter' || key === '=') { e.preventDefault(); this.handleEqual(); }
        else if (key === 'Escape' || key === 'Backspace' || key === 'c') this.resetCalculator();
        this.updateDisplay();
    }
}

export default Calculator;