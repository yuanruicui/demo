document.addEventListener('DOMContentLoaded', function() {
    const itemInput = document.getElementById('itemInput');
    const formatBtn = document.getElementById('formatBtn');
    const convertBtn = document.getElementById('convertBtn');
    const copyBtn = document.getElementById('copyBtn');
    const resetBtn = document.getElementById('resetBtn');
    const exchangeRate = document.getElementById('exchangeRate');
    const sourceCurrency = document.getElementById('sourceCurrency');
    const resultsBody = document.getElementById('resultsBody');
    const themeToggle = document.getElementById('themeToggle');
    const notification = document.getElementById('notification');
    
    // 默认汇率（示例值）
    const defaultExchangeRates = {
        THB: 0.027,
        TWD: 0.031,
        SGD: 0.74,
        IDR: 0.000065,
        JPY: 0.0068,
        HKD: 0.128,
        MYR: 0.214,
        PHP: 0.018,
        VND: 0.000042,
        KRW: 0.00075
    };
    
    // 设置初始汇率
    exchangeRate.value = defaultExchangeRates[sourceCurrency.value];
    
    // 主题切换
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        const icon = themeToggle.querySelector('i');
        if (document.body.classList.contains('dark-mode')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    });
    
    // 货币选择变化时更新汇率
    sourceCurrency.addEventListener('change', function() {
        exchangeRate.value = defaultExchangeRates[this.value];
    });
    
    // 格式化并排序
    formatBtn.addEventListener('click', function() {
        const inputText = itemInput.value.trim();
        if (!inputText) {
            alert('请输入商品数据');
            return;
        }
        
        const items = parseItems(inputText);
        if (items.length === 0) {
            alert('未找到有效的商品数据');
            return;
        }
        
        // 按价格排序（从低到高）
        items.sort((a, b) => a.price - b.price);
        
        displayItems(items);
    });
    
    // 转换为美元
    convertBtn.addEventListener('click', function() {
        const rate = parseFloat(exchangeRate.value) || defaultExchangeRates[sourceCurrency.value];
        const rows = resultsBody.querySelectorAll('tr');
        
        if (rows.length === 0) {
            alert('请先格式化数据');
            return;
        }
        
        rows.forEach(row => {
            const originalCell = row.cells[2];
            const usdCell = row.cells[3];
            const priceValue = parseFloat(originalCell.dataset.price);
            
            if (!isNaN(priceValue)) {
                const usdValue = priceValue * rate;
                usdCell.textContent = usdValue.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
                usdCell.classList.add('price-usd');
            }
        });
    });
    
    // 复制结果
    copyBtn.addEventListener('click', function() {
        const rows = resultsBody.querySelectorAll('tr');
        if (rows.length === 0) {
            alert('没有可复制的数据');
            return;
        }
        
        let textToCopy = '序号\t商品名称\t原始价格\t美元价格 (USD)\n';
        rows.forEach(row => {
            const cells = Array.from(row.cells).map(cell => cell.textContent.trim());
            textToCopy += cells.join('\t') + '\n';
        });
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            showNotification();
        }, () => {
            alert('复制失败，请手动复制');
        });
    });
    
    // 重置
    resetBtn.addEventListener('click', function() {
        itemInput.value = '';
        resultsBody.innerHTML = '';
        sourceCurrency.value = 'THB';
        exchangeRate.value = defaultExchangeRates['THB'];
    });
    
    // 解析输入文本
    function parseItems(text) {
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);
        const items = [];
        const priceRegex = /([฿NT$S$Rp¥HK$RM₱₫₩])?([\d,]+\.?\d*)/;
        
        for (let i = 0; i < lines.length; i++) {
            // 尝试将当前行作为名称，下一行作为价格
            if (i + 1 < lines.length) {
                const name = lines[i];
                const priceLine = lines[i+1];
                const priceMatch = priceLine.match(priceRegex);
                
                if (priceMatch) {
                    const priceStr = priceMatch[2].replace(/,/g, '');
                    const price = parseFloat(priceStr);
                    if (!isNaN(price)) {
                        items.push({ name, price, originalPrice: priceLine });
                        i++; // 跳过价格行
                        continue;
                    }
                }
            }
            
            // 如果上述模式不匹配，尝试在单行中查找名称和价格
            const singleLineMatch = lines[i].match(/(.*?)\s+([฿NT$S$Rp¥HK$RM₱₫₩])?([\d,]+\.?\d*)$/);
            if (singleLineMatch) {
                const name = singleLineMatch[1].trim();
                const priceStr = singleLineMatch[3].replace(/,/g, '');
                const price = parseFloat(priceStr);
                if (!isNaN(price)) {
                    items.push({ name, price, originalPrice: lines[i].replace(name, '').trim() });
                }
            }
        }
        return items;
    }
    
    // 显示项目
    function displayItems(items) {
        resultsBody.innerHTML = '';
        items.forEach((item, index) => {
            const row = resultsBody.insertRow();
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.name}</td>
                <td class="price-original" data-price="${item.price}">${item.originalPrice}</td>
                <td>-</td>
            `;
        });
    }

    // 显示通知
    function showNotification() {
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    }
});