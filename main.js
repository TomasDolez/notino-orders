const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1TgaPpTeLZLoDiKp00zdRL16ad0xdlhH6OXDWZCV8-9s/gviz/tq?tqx=out:csv';

// Lepší CSV parser pro data s čárkami/uvozovkami
function parseCSV(text) {
    const rows = [];
    let row = [];
    let cell = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '"') {
            if (inQuotes && text[i + 1] === '"') {
                cell += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            row.push(cell);
            cell = '';
        } else if ((char === '\n' || char === '\r') && !inQuotes) {
            row.push(cell);
            if (row.length > 1 || (row.length === 1 && row[0])) rows.push(row);
            row = [];
            cell = '';
            if (char === '\r' && text[i + 1] === '\n') i++;
        } else {
            cell += char;
        }
    }
    if (cell || row.length > 0) row.push(cell);
    if (row.length > 1 || (row.length === 1 && row[0])) rows.push(row);
    return rows;
}

async function fetchSheetData() {
    const res = await fetch(SHEET_URL);
    const text = await res.text();
    const rows = parseCSV(text);
    const headers = rows[0].map(h => h.trim());
    const data = rows.slice(1).map(r => {
        let obj = {};
        r.forEach((v, i) => obj[headers[i]] = v.trim());
        return obj;
    });
    return data;
}

function renderTable(data, filter = "") {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = "";

    let filtered = data.filter(row =>
        (row['Name'] || '').toLowerCase().includes(filter) ||
        (row['Contacts'] || '').toLowerCase().includes(filter)
    );

    filtered.forEach(row => {
        tbody.innerHTML += `
            <tr>
                <td>${row['Name'] || ""}</td>
                <td>${row['Purchase Date'] || ""}</td>
                <td>${row['Pick Date'] || ""}</td>
                <td>${row['Order Number'] || ""}</td>
                <td>${row['Price'] || ""}</td>
                <td>${row['Contacts'] || ""}</td>
                <td><input type="checkbox" disabled ${row['Ready'].toLowerCase() === "yes" ? "checked" : ""}></td>
                <td><input type="checkbox" disabled ${row['Picked'].toLowerCase() === "yes" ? "checked" : ""}></td>
            </tr>
        `;
    });

    document.getElementById('totalCount').textContent = data.length;
    document.getElementById('readyCount').textContent = data.filter(d => (d['Ready'] || '').toLowerCase() === "yes").length;
    document.getElementById('pickedCount').textContent = data.filter(d => (d['Picked'] || '').toLowerCase() === "yes").length;
}

let DATA = [];
document.addEventListener("DOMContentLoaded", async () => {
    DATA = await fetchSheetData();
    renderTable(DATA);

    document.getElementById('searchInput').addEventListener('input', function() {
        renderTable(DATA, this.value.toLowerCase());
    });
});
