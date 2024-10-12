// Show section based on menu click
function showSection(sectionId) {
    const sections = document.querySelectorAll('.content');
    sections.forEach(section => section.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';
}

// Set default date and prepare token functionality
window.onload = function() {
    var today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;

    document.getElementById('fromTokenNo').addEventListener('input', calculateTotalTokens);
    document.getElementById('toTokenNo').addEventListener('input', calculateTotalTokens);

    loadTokenData(); // Load data on page load
    showSection('addToken'); // Show 'Add Token' section by default
}

// Function to calculate total tokens
function calculateTotalTokens() {
    var fromTokenNo = parseInt(document.getElementById('fromTokenNo').value) || 0;
    var toTokenNo = parseInt(document.getElementById('toTokenNo').value) || 0;
    if (toTokenNo >= fromTokenNo) {
        document.getElementById('totalTokens').value = toTokenNo - fromTokenNo + 1;
    } else {
        document.getElementById('totalTokens').value = 0;
    }
}

// Add or edit token entry
var currentEditIndex = null;

function submitToken() {
    var data = {
        date: document.getElementById('date').value,
        gateNumber: document.getElementById('gateNumber').value,
        mealType: document.getElementById('mealType').value,
        fromTokenNo: document.getElementById('fromTokenNo').value,
        toTokenNo: document.getElementById('toTokenNo').value,
        totalTokens: document.getElementById('totalTokens').value
    };

    if (currentEditIndex === null) {
        // Add token entry
        google.script.run.withSuccessHandler(function() {
            alert("Token entry added successfully!");
            document.getElementById('tokenForm').reset();
            loadTokenData();
        }).submitTokenEntry(data);
    } else {
        // Edit token entry
        google.script.run.withSuccessHandler(function() {
            alert("Token entry updated successfully!");
            document.getElementById('tokenForm').reset();
            currentEditIndex = null;
            loadTokenData();
        }).editTokenEntry(currentEditIndex, data);
    }
}

// Load token data for editing or deleting
function loadTokenData() {
    google.script.run.withSuccessHandler(function(data) {
        const tableBody = document.querySelector('#tokenTable tbody');
        tableBody.innerHTML = ''; // Clear table
        data.forEach(function(row, index) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row[0]}</td>
                <td>${row[1]}</td>
                <td>${row[2]}</td>
                <td>${row[3]}</td>
                <td>${row[4]}</td>
                <td>${row[5]}</td>
                <td>
                    <button onclick="editToken(${index}, '${row[0]}', '${row[1]}', '${row[2]}', '${row[3]}', '${row[4]}', '${row[5]}')">Edit</button>
                    <button onclick="deleteToken(${index})">Delete</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }).getTokenData();
}

// Edit token entry
function editToken(index, date, gateNumber, mealType, fromTokenNo, toTokenNo, totalTokens) {
    currentEditIndex = index;
    document.getElementById('date').value = date;
    document.getElementById('gateNumber').value = gateNumber;
    document.getElementById('mealType').value = mealType;
    document.getElementById('fromTokenNo').value = fromTokenNo;
    document.getElementById('toTokenNo').value = toTokenNo;
    document.getElementById('totalTokens').value = totalTokens;
}

// Delete token entry
function deleteToken(index) {
    if (confirm("Are you sure you want to delete this entry?")) {
        google.script.run.withSuccessHandler(function() {
            alert("Token entry deleted successfully!");
            loadTokenData();
        }).deleteTokenEntry(index);
    }
}

// Generate report
function generateReport() {
    google.script.run.withSuccessHandler(function(reportData) {
        const reportContent = document.getElementById('reportContent');
        reportContent.innerHTML = ''; // Clear previous report
        reportContent.innerHTML = `
            <p>Total Tokens Issued: ${reportData.totalTokens}</p>
            <p>Tokens by Gate: ${JSON.stringify(reportData.tokensByGate)}</p>
            <p>Tokens by Meal Type: ${JSON.stringify(reportData.tokensByMeal)}</p>
        `;
    }).generateTokenReport();
}

// Search tokens
function searchTokens() {
    const input = document.getElementById('searchInput').value.toUpperCase();
    const tableRows = document.querySelectorAll('#searchTokenTable tbody tr');
    tableRows.forEach(row => {
        const dateText = row.cells[0].innerText.toUpperCase();
        const gateText = row.cells[1].innerText.toUpperCase();
        row.style.display = (dateText.indexOf(input) > -1 || gateText.indexOf(input) > -1) ? '' : 'none';
    });
}
