document.addEventListener('DOMContentLoaded', () => {
    const itemInput = document.getElementById('itemInput');
    const formatBtn = document.getElementById('formatBtn');
    const convertBtn = document.getElementById('convertBtn');
    const copyBtn = document.getElementById('copyBtn');
    const resetBtn = document.getElementById('resetBtn');
    const resultsBody = document.getElementById('resultsBody');
    const sourceCurrencySelect = document.getElementById('sourceCurrency');
    const exchangeRateInput = document.getElementById('exchangeRate');
    const themeToggle = document.getElementById('themeToggle');
    const notification = document.getElementById('notification');

    const exchangeRates = {
        THB: 0.027, TWD: 0.031, SGD: 0.74, IDR: 0.000061,
        JPY: 0.0067, HKD: 0.13, MYR: 0.21, PHP: 0.017,
        VND: 0.000039, KRW: 0.00072
    };

    let formattedData = [];

    /**
     * @description Updates the exchange rate input based on the selected currency.
     */
    function updateExchangeRate() {
        const selectedCurrency = sourceCurrencySelect.value;
        exchangeRateInput.value = exchangeRates[selectedCurrency] || 0;
    }

    /**
     * @description Parses and formats the input data.
     */
    function formatAndSort() {
        const lines = itemInput.value.trim().split('\n');
        const items = [];
        for (let i = 0; i < lines.length; i += 2) {
            if (lines[i] && lines[i+1]) {
                const name = lines[i].trim();
                const priceStr = lines[i+1].trim();
                const price = parseFloat(priceStr.replace(/[^\d.-]/g, ''));
                if (name && !isNaN(price)) {
                    items.push({ name, price, originalPrice: priceStr });
                }
            }
        }
        
        items.sort((a, b) => a.price - b.price);
        formattedData = items;
        renderTable();
    }

    /**
     * @description Renders the formatted data into the results table.
     * @param {boolean} showUsd - Whether to show the price in USD.
     */
    function renderTable(showUsd = false) {
        resultsBody.innerHTML = '';
        const rate = parseFloat(exchangeRateInput.value);

        if (isNaN(rate) || rate <= 0) {
            alert('请输入有效的汇率！');
            return;
        }

        formattedData.forEach((item, index) => {
            const row = document.createElement('tr');
            const usdPrice = showUsd ? (item.price * rate).toFixed(2) : 'N/A';
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.name}</td>
                <td class="price-original">${item.originalPrice}</td>
                <td class="price-usd">${usdPrice}</td>
            `;
            resultsBody.appendChild(row);
        });
    }

    /**
     * @description Converts the prices in the table to USD.
     */
    function convertToUsd() {
        if (formattedData.length === 0) {
            alert('请先格式化数据！');
            return;
        }
        renderTable(true);
    }

    /**
     * @description Copies the results table to the clipboard.
     */
    function copyResults() {
        if (formattedData.length === 0) {
            alert('没有可复制的结果！');
            return;
        }
        
        let tsv = '序号\t商品名称\t原始价格\t美元价格 (USD)\n';
        const rate = parseFloat(exchangeRateInput.value);
        const showUsd = resultsBody.querySelector('.price-usd')?.textContent !== 'N/A';

        formattedData.forEach((item, index) => {
            const usdPrice = showUsd ? (item.price * rate).toFixed(2) : 'N/A';
            tsv += `${index + 1}\t${item.name}\t${item.originalPrice}\t${usdPrice}\n`;
        });

        navigator.clipboard.writeText(tsv).then(() => {
            showNotification();
        }, () => {
            alert('复制失败，请手动复制。');
        });
    }
    
    /**
     * @description Shows a notification to the user.
     */
    function showNotification() {
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    }

    /**
     * @description Resets the input and results.
     */
    function resetAll() {
        itemInput.value = '';
        resultsBody.innerHTML = '';
        formattedData = [];
        sourceCurrencySelect.value = 'THB';
        updateExchangeRate();
    }

    /**
     * @description Toggles dark mode for the page.
     */
    function toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const icon = themeToggle.querySelector('i');
        if (document.body.classList.contains('dark-mode')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }

    // Event Listeners
    sourceCurrencySelect.addEventListener('change', updateExchangeRate);
    formatBtn.addEventListener('click', formatAndSort);
    convertBtn.addEventListener('click', convertToUsd);
    copyBtn.addEventListener('click', copyResults);
    resetBtn.addEventListener('click', resetAll);
    themeToggle.addEventListener('click', toggleTheme);

    // Initial setup
    updateExchangeRate();
});