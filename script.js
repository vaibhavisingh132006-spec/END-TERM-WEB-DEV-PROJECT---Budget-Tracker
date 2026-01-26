let allTransactions = [];
let activeFilter = 'all';

const incomeCats = ['Salary','Freelance','Investment','Gift','Other'];
const expenseCats = ['Food','Transport','Shopping','Bills','Health','Entertainment'];

function saveToStorage() {
    let data = '';
    allTransactions.forEach((t, i) => {
        data += `${t.id}|${t.desc}|${t.amount}|${t.type}|${t.cat}|${t.date}`;
        if (i !== allTransactions.length - 1) data += ';';
    });
    localStorage.setItem('financeData', data);
}

function loadFromStorage() {
    let data = localStorage.getItem('financeData');
    if (!data) return;

    data.split(';').forEach(r => {
        let p = r.split('|');
        allTransactions.push({
            id: Number(p[0]),
            desc: p[1],
            amount: Number(p[2]),
            type: p[3],
            cat: p[4],
            date: p[5]
        });
    });
}

document.getElementById('type').addEventListener('change', function () {
    let catBox = document.getElementById('category');
    catBox.innerHTML = '<option value="">Category</option>';
    let list = this.value === 'income' ? incomeCats : expenseCats;
    list.forEach(c => {
        let opt = document.createElement('option');
        opt.value = opt.textContent = c;
        catBox.appendChild(opt);
    });
});

document.getElementById('transactionForm').addEventListener('submit', function (e) {
    e.preventDefault();

    let desc = description.value.trim();
    let amt = Number(amount.value);
    let type = document.getElementById('type').value;
    let cat = category.value;

    if (!desc || amt <= 0 || !type || !cat) {
        errorMsg.textContent = 'Enter valid details';
        return;
    }

    errorMsg.textContent = '';

    allTransactions.push({
        id: Date.now(),
        desc,
        amount: amt,
        type,
        cat,
        date: new Date().toLocaleDateString()
    });

    saveToStorage();
    this.reset();
    refreshUI();
});

document.getElementById('filterButtons').addEventListener('click', e => {
    if (!e.target.classList.contains('filter-btn')) return;
    activeFilter = e.target.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    renderTransactions();
});

function updateCards() {
    let income = 0, expense = 0;
    allTransactions.forEach(t => {
        t.type === 'income' ? income += t.amount : expense += t.amount;
    });
    totalIncome.textContent = `₹${income}`;
    totalExpense.textContent = `₹${expense}`;
    balance.textContent = `₹${income - expense}`;
}

function renderTransactions() {
    transactionsList.innerHTML = '';

    let data = activeFilter === 'all'
        ? allTransactions
        : allTransactions.filter(t => t.type === activeFilter);

    if (!data.length) {
        transactionsList.innerHTML = '<div class="empty-state">No transactions</div>';
        return;
    }

    data.slice().reverse().forEach(t => {
        let div = document.createElement('div');
        div.className = 'transaction-item';

        div.innerHTML = `
            <div>
                <strong>${t.desc}</strong><br>${t.cat} • ${t.date}
            </div>
            <div class="${t.type}">
                ${(t.type === 'expense' ? '-' : '+')}₹${t.amount}
            </div>
            <button class="delete-btn">Delete</button>
        `;

        div.querySelector('.delete-btn').onclick = () => {
            allTransactions = allTransactions.filter(x => x.id !== t.id);
            saveToStorage();
            refreshUI();
        };

        transactionsList.appendChild(div);
    });
}

function renderChart() {
    categoryChart.innerHTML = '';
    let totals = {}, sum = 0;

    allTransactions.forEach(t => {
        if (t.type === 'expense') {
            totals[t.cat] = (totals[t.cat] || 0) + t.amount;
            sum += t.amount;
        }
    });

    if (!sum) {
        categoryChart.innerHTML = '<div class="empty-state">No expense data</div>';
        return;
    }

    for (let c in totals) {
        let p = ((totals[c] / sum) * 100).toFixed(1);
        categoryChart.innerHTML += `
            <div>${c} - ₹${totals[c]}</div>
            <div class="category-bar">
                <div class="category-bar-fill" style="width:${p}%">${p}%</div>
            </div>`;
    }
}

function refreshUI() {
    updateCards();
    renderTransactions();
    renderChart();
}

window.onload = () => {
    loadFromStorage();
    refreshUI();
};
