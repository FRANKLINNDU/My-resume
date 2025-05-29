/**
 * Currency Converter for TicketSales Website
 * Handles conversion between USD and NGN (Nigerian Naira)
 */

class CurrencyConverter {
    constructor() {
        // Default exchange rate (1 USD to NGN)
        // This would ideally be updated from an API
        this.exchangeRate = 1500; 
        this.currentCurrency = 'USD';
        this.currencies = ['USD', 'NGN'];
        
        // Initialize the converter
        this.init();
    }
    
    init() {
        // Create currency toggle if it doesn't exist
        this.createCurrencyToggle();
        
        // Initial conversion of all prices on the page
        this.updateAllPrices();
        
        // Listen for currency switch events
        document.addEventListener('currencyChanged', (e) => {
            this.currentCurrency = e.detail.currency;
            this.updateAllPrices();
        });
    }
    
    createCurrencyToggle() {
        // Check if toggle already exists
        if (document.getElementById('currency-toggle')) return;
        
        // Create the toggle element
        const toggle = document.createElement('div');
        toggle.id = 'currency-toggle';
        toggle.className = 'currency-toggle';
        
        // Create toggle buttons
        this.currencies.forEach(currency => {
            const button = document.createElement('button');
            button.className = `currency-btn ${currency === this.currentCurrency ? 'active' : ''}`;
            button.textContent = currency;
            button.onclick = () => this.switchCurrency(currency);
            toggle.appendChild(button);
        });
        
        // Add toggle to the page header
        const header = document.querySelector('header') || document.querySelector('nav');
        if (header) {
            header.appendChild(toggle);
        } else {
            // If no header/nav, add to body
            document.body.insertBefore(toggle, document.body.firstChild);
        }
        
        // Add styles
        this.addStyles();
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .currency-toggle {
                display: inline-flex;
                background: #f3f4f6;
                border-radius: 8px;
                padding: 2px;
                margin-left: 15px;
            }
            
            .currency-btn {
                padding: 5px 10px;
                border: none;
                background: transparent;
                cursor: pointer;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
            }
            
            .currency-btn.active {
                background: #6d28d9;
                color: white;
            }
            
            .price-display {
                display: flex;
                flex-direction: column;
            }
            
            .price-primary {
                font-weight: bold;
            }
            
            .price-secondary {
                font-size: 0.8em;
                color: #6b7280;
            }
        `;
        document.head.appendChild(style);
    }
    
    switchCurrency(currency) {
        if (currency === this.currentCurrency) return;
        
        // Update active button
        const buttons = document.querySelectorAll('.currency-btn');
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.textContent === currency);
        });
        
        // Dispatch event for currency change
        const event = new CustomEvent('currencyChanged', {
            detail: { currency: currency }
        });
        document.dispatchEvent(event);
    }
    
    updateAllPrices() {
        // Find all elements with price data
        const priceElements = document.querySelectorAll('[data-price]');
        
        priceElements.forEach(el => {
            const priceUSD = parseFloat(el.getAttribute('data-price'));
            if (isNaN(priceUSD)) return;
            
            this.updatePriceDisplay(el, priceUSD);
        });
        
        // Also look for elements with price text
        const possiblePriceElements = document.querySelectorAll('*');
        possiblePriceElements.forEach(el => {
            if (!el.childNodes || el.childNodes.length !== 1 || el.childNodes[0].nodeType !== Node.TEXT_NODE) return;
            
            const text = el.textContent.trim();
            if (!text.startsWith('$')) return;
            
            // Try to extract price
            const priceMatch = text.match(/\$(\d+(\.\d+)?)/);
            if (priceMatch) {
                const priceUSD = parseFloat(priceMatch[1]);
                if (!isNaN(priceUSD) && !el.hasAttribute('data-price')) {
                    // Add data attribute for future updates
                    el.setAttribute('data-price', priceUSD);
                    this.updatePriceDisplay(el, priceUSD);
                }
            }
        });
    }
    
    updatePriceDisplay(element, priceUSD) {
        // Create or get price display container
        let container = element.querySelector('.price-display');
        if (!container) {
            container = document.createElement('div');
            container.className = 'price-display';
            element.innerHTML = '';
            element.appendChild(container);
        }
        
        // Calculate prices
        const priceNGN = priceUSD * this.exchangeRate;
        
        // Format prices
        const formattedUSD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(priceUSD);
        const formattedNGN = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(priceNGN);
        
        // Determine primary and secondary currencies
        const primaryPrice = this.currentCurrency === 'USD' ? formattedUSD : formattedNGN;
        const secondaryPrice = this.currentCurrency === 'USD' ? formattedNGN : formattedUSD;
        
        // Update display
        container.innerHTML = `
            <span class="price-primary">${primaryPrice}</span>
            <span class="price-secondary">${secondaryPrice}</span>
        `;
    }
    
    // Utility method to convert prices
    convertPrice(amount, fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) return amount;
        
        if (fromCurrency === 'USD' && toCurrency === 'NGN') {
            return amount * this.exchangeRate;
        } else if (fromCurrency === 'NGN' && toCurrency === 'USD') {
            return amount / this.exchangeRate;
        }
        
        return amount; // Default fallback
    }
    
    // Method to fetch current exchange rates from an API
    // This would be implemented in a production environment
    async fetchExchangeRates() {
        try {
            // Example API call (would need to be replaced with actual API)
            // const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            // const data = await response.json();
            // this.exchangeRate = data.rates.NGN;
            
            // For demo purposes, we'll just use the hardcoded rate
            console.log('Using fixed exchange rate for demo purposes');
        } catch (error) {
            console.error('Error fetching exchange rates:', error);
        }
    }
}

// Initialize the converter when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    window.currencyConverter = new CurrencyConverter();
});
