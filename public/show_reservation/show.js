

let idNumber;

const fieldMapping = {
  "startDate": "start",
  "endDate": "end",
  "firstName": "first_name", // Note: will need special handling since DB stores full name
  "lastName": "last_name",  // Note: will need special handling since DB stores full name
  "address": "address",
  "address2": "address2", 
  "city": "city",
  "state": "state",
  "zip": "postal",
  "phone": "phone",
  "email": "email",
  "boatName": "boat_name",
  "boatSize": "length",
  "rigType": "type"
};

window.onload = async function () {
    const urlParams = new URLSearchParams(window.location.search);
    idNumber = urlParams.get("number")

    console.log(urlParams);

    await populateFields(urlParams);

    await calcPrice();
    
}

async function populateFields(data){
    console.log("HERE")
    let reservationData;
    await fetch("/api/reservations/get_by_id", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({"id": data.get("number")})
    })
    .then(res => res.json())
    .then(data => {
        console.log(data)
        document.getElementById("startDate").value = data.start;
        document.getElementById("endDate").value = data.end;

        document.getElementById("firstName").value = data.first_name
        document.getElementById("lastName").value = data.last_name;

        document.getElementById("lastName").disabled = true;


        document.getElementById("address").value = data.address;
        document.getElementById("address2").value = data.address2;
        document.getElementById("city").value = data.city;

        document.getElementById("state").value = data.state;
        document.getElementById("state").disabled = true;

        document.getElementById("zip").value = data.postal;
        document.getElementById("phone").value = data.phone;
        document.getElementById("email").value = data.email;
        document.getElementById("boatName").value = data.boat_name;
        document.getElementById("boatSize").value = data.length;
        document.getElementById("rigType").value = data.type;
        
        let spaceTable = document.querySelector(".site-info-table");
        spaceTable.rows[1].cells[0].innerText = data.space;
    })

    
}   
// Basic form functionality
function changeDates() {
    // Your date change logic here
    console.log("change Date")
    let spaceTable = document.querySelector(".site-info-table");
    let space = spaceTable.rows[1].cells[0].innerText;

    let redirectUrl = `http://localhost:3000/show_reservation/change_date?space=${space}&id=${idNumber}&start=${document.getElementById("startDate").value}&end=${document.getElementById("endDate").value}`
    window.location.href = redirectUrl;

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

function cancelReservation(){
    if(confirm(`Confirm cancellation of reservation #${idNumber}?`)){
        fetch("/api/reservations/delete", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({id: idNumber})
        })
        .then(res => res.json())
        .then(data => {
            if(data.success){
                window.location.href = "http://localhost:3000"
            }
            else if(data.error){
                alert(data.err)
            }
        })
    }
}

function toggleEdit(fieldId, button) {
const field = document.getElementById(fieldId);
if (field.disabled) {
    field.disabled = false;
    field.focus();
    button.textContent = 'Save';
    button.className = 'save-btn';
    button.setAttribute('onclick', `saveField('${fieldId}', this)`);
}
}

function toggleEditSelect(fieldId, button) {
    const field = document.getElementById(fieldId);
    if (field.disabled) {
        field.disabled = false;
        field.focus();
        button.textContent = 'Save';
        button.className = 'save-btn';
        button.setAttribute('onclick', `saveSelectField('${fieldId}', this)`);
        }
}

function toggleEditTextarea(fieldId, button) {
    const field = document.getElementById(fieldId);
    if (field.disabled) {
        field.disabled = false;
        field.focus();
        button.textContent = 'Save';
        button.className = 'save-btn';
        button.setAttribute('onclick', `saveTextareaField('${fieldId}', this)`);
        }
}

function saveField(fieldId, button) {
    const field = document.getElementById(fieldId);
    field.disabled = true;
    button.textContent = 'Edit';
    button.className = 'edit-btn';
    button.setAttribute('onclick', `toggleEdit('${fieldId}', this)`);
    console.log(`${field.id} changed to: ${field.value}`)


    if(fieldId )
    fetch("/api/reservations/update", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            id: idNumber,
            name: fieldMapping[fieldId],
            value: field.value
        })
    })
}


// Handle Enter key to save field
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT' && !e.target.disabled) {
        const button = e.target.parentElement.querySelector('.save-btn');
        if (button) {
            button.click();
        }
    }
});

function saveSelect(fieldID){
    let selectValue = document.getElementById(fieldID).value;
    console.log(selectValue)
}