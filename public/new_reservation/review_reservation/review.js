window.onload = async function () {
    const urlParams = new URLSearchParams(window.location.search);

    console.log(urlParams);
    populateFields(urlParams);

    await calcPrice();
    
}

function populateFields(data){
    document.getElementById("firstName").value = data.get("firstName");
    document.getElementById("lastName").value = data.get("lastName");
    document.getElementById("address").value = data.get("address");
    document.getElementById("address2").value = data.get("address2");
    document.getElementById("city").value = data.get("city");
    document.getElementById("state").value = data.get("state");
    document.getElementById("zip").value = data.get("zip");
    document.getElementById("phone").value = data.get("phone");
    document.getElementById("email").value = data.get("email");
    document.getElementById("boatName").value = data.get("boatName");
    document.getElementById("boatSize").value = data.get("boatLength");
    document.getElementById("rigType").value = data.get("type")

    let dateStart = new Date(data.get("start"))

    let yyyy = dateStart.getFullYear();
    let mm = String(dateStart.getMonth() + 1).padStart(2, '0'); // months are 0-based
    let dd = String(dateStart.getDate()).padStart(2, '0');

    let formatted = `${yyyy}-${mm}-${dd}`;

    document.getElementById("startDate").value = formatted

    let dateEnd = new Date(data.get("end"))

    yyyy = dateEnd.getFullYear();
    mm = String(dateEnd.getMonth() + 1).padStart(2, '0'); // months are 0-based
    dd = String(dateEnd.getDate()).padStart(2, '0');

    formatted = `${yyyy}-${mm}-${dd}`;

    document.getElementById("endDate").value=formatted

    let siteTable = document.querySelector(".site-info-table");
    siteTable.rows[1].cells[0].innerText = data.get("space")

}   
// Basic form functionality
function changeDates() {
    // Your date change logic here
}

function sendEmail() {
    // Your email logic here
}

function changeSpace() {
    // Your space change logic here
}

function checkInNow() {
    // Your check-in logic here
}

function completeReservation() {
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'address', 'city', 'phone', 'email'];
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            field.style.borderColor = '#e53e3e';
            isValid = false;
        } else {
            field.style.borderColor = '';
        }
    });
    
    if (!isValid) {
        alert('Please fill in all required fields.');
        return;
    }

    let siteTable = document.querySelector(".site-info-table");
    let space = siteTable.rows[1].cells[0].innerText;

    let rateDatble = document.querySelector(".rate-table");
    let due = rateDatble.rows[2].cells[5].innerText;

    let requestBody = {
        start: document.getElementById("startDate").value,
        end: (document.getElementById("endDate").value),
        type: document.getElementById("rigType").value,
        length: document.getElementById("boatSize").value,
        space: space,
        payment: 0,
        due: due,
        address: document.getElementById("address").value,
        address2: document.getElementById("address2").value,
        state: document.getElementById("state").value,
        city: document.getElementById("city").value,
        postal: document.getElementById("zip").value,
        phone: document.getElementById("phone").value,
        email: document.getElementById("email").value,
        boat_name: document.getElementById("boatName").value,
        last_name: document.getElementById("lastName").value,
        first_name: document.getElementById("firstName").value

    }

    fetch("/api/reservations", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(requestBody)
    })
    .then(res => res.json())
    .then(data => {
        console.log(data)
        if(data.success){
            alert("Reservation complete.")
            window.location.href = "http://localhost:3000/"
        }
    })
}

// Auto-calculate dates and rates
 function calcPrice() {
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    const start = new Date(startDate.value);
    const end = new Date(endDate.value);
    const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    
    // Update the rate table
    const rateRow = document.querySelector('.rate-table tbody tr:first-child');
    if (rateRow) {
        rateRow.cells[1].textContent = startDate.value;
        rateRow.cells[2].textContent = endDate.value;
        rateRow.cells[3].textContent = days.toFixed(2);
        
        const dailyRate = 50.00;
        const total = days * dailyRate;
        rateRow.cells[5].textContent = `$${total.toFixed(2)}`;
        
        // Update totals
        const totalRow = document.querySelector('.rate-table tbody tr:nth-child(2)');
        const amountDueRow = document.querySelector('.rate-table tbody tr:nth-child(3)');
        totalRow.cells[5].textContent = `$${total.toFixed(2)}`;
        amountDueRow.cells[5].textContent = `$${total.toFixed(2)}`;
    }
    
}
function formatDate(date) {
        return date.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
        });
    }