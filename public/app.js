const STORAGE_KEY = 'wpocket-entries';

const form = document.getElementById('entryForm');
const entriesList = document.getElementById('entriesList');
const incomeTotalEl = document.getElementById('incomeTotal');
const expenseTotalEl = document.getElementById('expenseTotal');
const balanceTotalEl = document.getElementById('balanceTotal');
const clearButton = document.getElementById('clearEntries');

const formatCurrency = (value) => `¥${Math.round(value).toLocaleString('en-US')}`;

const readEntries = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeEntries = (entries) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

const renderEntries = () => {
  const entries = readEntries();

  if (!entries.length) {
    entriesList.innerHTML = '<li class="empty-state">No entries yet. Add your first transaction.</li>';
    incomeTotalEl.textContent = formatCurrency(0);
    expenseTotalEl.textContent = formatCurrency(0);
    balanceTotalEl.textContent = formatCurrency(0);
    return;
  }

  const incomeTotal = entries
    .filter((entry) => entry.type === 'income')
    .reduce((sum, entry) => sum + Number(entry.amount), 0);

  const expenseTotal = entries
    .filter((entry) => entry.type === 'expense')
    .reduce((sum, entry) => sum + Number(entry.amount), 0);

  const balance = incomeTotal - expenseTotal;

  incomeTotalEl.textContent = formatCurrency(incomeTotal);
  expenseTotalEl.textContent = formatCurrency(expenseTotal);
  balanceTotalEl.textContent = formatCurrency(balance);

  entriesList.innerHTML = entries
    .slice()
    .reverse()
    .map((entry) => {
      const noteText = entry.note ? `<span>• ${entry.note}</span>` : '';
      return `
        <li class="entry-item ${entry.type}">
          <div>
            <strong>${entry.category}</strong>
            <div class="entry-meta">
              <span>${new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              <span>${entry.type === 'income' ? 'Income' : 'Expense'}</span>
              ${noteText}
            </div>
          </div>
          <div class="entry-amount ${entry.type === 'income' ? 'income' : 'expense'}">
            ${entry.type === 'income' ? '+' : '-'}${formatCurrency(entry.amount)}
          </div>
        </li>
      `;
    })
    .join('');
};

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const entries = readEntries();
  const nextEntry = {
    id: Date.now().toString(),
    type: document.getElementById('type').value,
    amount: Number(document.getElementById('amount').value),
    category: document.getElementById('category').value.trim(),
    date: document.getElementById('date').value,
    note: document.getElementById('note').value.trim()
  };

  if (!nextEntry.category || !nextEntry.date || !nextEntry.amount || Number.isNaN(nextEntry.amount) || nextEntry.amount <= 0) {
    return;
  }

  entries.push(nextEntry);
  writeEntries(entries);
  form.reset();
  document.getElementById('date').valueAsDate = new Date();
  renderEntries();
});

clearButton.addEventListener('click', () => {
  localStorage.removeItem(STORAGE_KEY);
  renderEntries();
});

document.getElementById('date').valueAsDate = new Date();
renderEntries();
