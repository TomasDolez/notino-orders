// ======= CONFIG =======
const NOTION_DATABASE_ID = '1fa69beab47a80e38fa7d1fc7125f9a7'; // <-- doplníš ID
const NOTION_API_KEY = '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'; // <-- doplníš secret
// =======================

// ======= FETCH FROM NOTION =======
async function fetchNotionData() {
    const url = `https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`;

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${NOTION_API_KEY}`,
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json"
        }
    });

    if (!res.ok) {
        alert("Chyba při načítání dat z Notion API");
        return [];
    }
    const data = await res.json();

    // Mapni výstup do použitelného formátu (dle tvých property names!)
    return data.results.map(page => ({
        name: page.properties["Name"].title[0]?.plain_text ?? "",
        purchaseDate: page.properties["Purchase Date"].date?.start ?? "",
        orderNumber: page.properties["Order Number"].rich_text[0]?.plain_text ?? "",
        price: page.properties["Price"].rich_text[0]?.plain_text ?? "",
        contacts: page.properties["Contacts"].people?.map(p => p.name).join(", ") ?? "",
        ready: page.properties["Ready"].checkbox ?? false,
        picked: page.properties["Picked"].checkbox ?? false
    }));
}
// ==================================

// ======= RENDERING =======
function renderTable(data, filter = "") {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = "";
    let filtered = data.filter(row =>
        row.name.toLowerCase().includes(filter) ||
        row.contacts.toLowerCase().includes(filter)
    );
    filtered.forEach(row => {
        tbody.innerHTML += `
      <tr>
        <td>${row.name}</td>
        <td>${row.purchaseDate}</td>
        <td>${row.orderNumber}</td>
        <td>${row.price}</td>
        <td>${row.contacts}</td>
        <td><input type="checkbox" disabled ${row.ready ? "checked" : ""}></td>
        <td><input type="checkbox" disabled ${row.picked ? "checked" : ""}></td>
      </tr>
    `;
    });

    document.getElementById('totalCount').textContent = data.length;
    document.getElementById('readyCount').textContent = data.filter(d => d.ready).length;
    document.getElementById('pickedCount').textContent = data.filter(d => d.picked).length;
}

// ======= MAIN LOGIC =======
let DATA = [];
document.addEventListener("DOMContentLoaded", async () => {
    // 1. Load data from Notion
    DATA = await fetchNotionData();

    // 2. Render table
    renderTable(DATA);

    // 3. Search
    document.getElementById('searchInput').addEventListener('input', function () {
        renderTable(DATA, this.value.toLowerCase());
    });
});
