let userTable;

$("#reservationForm").on("submit", async function (event) {

    event.preventDefault();
    
    // Get form data
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    // Basic validation
    const requiredFields = ['firstName', 'lastName', 'address', 'city', 'state', 'phone', 'email'];
    const missingFields = requiredFields.filter(field => !data[field] || data[field].trim() === '');
    
    if (missingFields.length > 0) {
        alert(`Please fill in the following required fields: ${missingFields.join(', ')}`);
        return;
    }
    
    // add data to camper db

    let camperPostBody = {
        first_name: data.firstName,
        last_name: data.lastName,
        address1: data.address,
        address2: data.address2,
        city: data.city,
        state: data.state,
        postal: data.zip,
        phone: data.phone,
        email: data.email,
        boat_name: data.boatName,
        boat_size: data.boatLength,
        boat_type: document.getElementById("rigType").value
    }

    await fetch("/api/campers/add", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(camperPostBody)
    })
    .then(res => res.json())
    .then(data => {
        if(data.error){
            alert("Failed to save camper to existing users");
        }
    })
    
    // If validation passes, process the form
    console.log('Form submitted with data:', data);
    const urlParams = new URLSearchParams(window.location.search);
    let redirectUrl = `http://localhost:3000/new_reservation/review_reservation/?firstName=${data.firstName}&lastName=${data.lastName}&address=${data.address}&address2=${data.address2}&city=${data.city}&state=${data.state}&zip=${data.zip}&email=${data.email}&phone=${data.phone}&boatName=${data.boatName}&boatLength=${data.boatLength}&space=${urlParams.get("space")}&start=${urlParams.get("start")}&end=${urlParams.get("end")}&type=${document.getElementById("rigType").value}`
    window.location.href = redirectUrl;
    
    // Here you would typically send the data to your server
    // For now, we'll just log it and show a success message
})


// User data will be populated by your code
let userData = {};

function selectUser(button) {
    const row = button.closest('tr');
    const name = row.cells[0].textContent;
    const user = userData[name];
    
    if (user) {
        // Fill the form with user data
        document.getElementById('firstName').value = user.firstName || '';
        document.getElementById('lastName').value = user.lastName || '';
        document.getElementById('address').value = user.address || '';
        document.getElementById('address2').value = user.address2 || '';
        document.getElementById('city').value = user.city || '';
        document.getElementById('state').value = user.state || '';
        document.getElementById('zip').value = user.zip || '';
        document.getElementById('phone').value = user.phone || '';
        document.getElementById('email').value = user.email || '';
        document.getElementById('boatName').value = user.boatName || '';
        document.getElementById('boatLength').value = user.boatLength || '';
        document.getElementById('rigType').value = user.rigType || 'Sail Boat';
        
        // Update field styling for filled fields
        const inputs = document.querySelectorAll('#reservationForm input[required]');
        inputs.forEach(input => {
            if (input.value.trim() !== '') {
                input.style.borderColor = '#4CAF50';
            }
        });
        
        // Show confirmation
        alert('User information loaded successfully!');
    }
}

function cancelReservation() {
    if (confirm('Are you sure you want to cancel? Any entered information will be lost.')) {
        // Clear the form
        document.getElementById('reservationForm').reset();
        
        // Reset field styling
        const inputs = document.querySelectorAll('#reservationForm input');
        inputs.forEach(input => {
            input.style.borderColor = '#ccc';
        });
        
        // Optionally redirect back to the main page
        window.location.href = 'http://localhost:3000/';
    }
}

// Initialize DataTable
$(document).ready(async function() {
    userTable = $('#usersTable').DataTable({
        pageLength: 50,
        lengthMenu: [10, 25, 50, 100],
        order: [[0, 'asc']],
        columnDefs: [
            { orderable: false, targets: 4 } // Disable sorting on Action column
        ]
    });
    await populateUserTable()
});

$('#usersTable').on('click', '.btn-select', function () {
    let rowData = userTable.row($(this).parents('tr')).data();
    console.log(rowData);
});

// Add real-time validation feedback
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                this.style.borderColor = '#f44336';
            } else {
                this.style.borderColor = '#4CAF50';
            }
        });
        
        input.addEventListener('input', function() {
            if (this.value.trim() !== '') {
                this.style.borderColor = '#4CAF50';
            }
        });
    });
});
function searchExistingUser(lastName){
    //let row = ["2","Jack Oosterwijk", "Oosterwijkcools@gmail.com", "9022988912", "Mahone Bay","<button class='btn btn-select'>Select</button>" ]
    //let node = userTable.row.add(row).draw().node();

    fetch("/api/campers", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({"lastName": lastName})
    })
    .then(res => res.json())
    .then(data => {
        console.log(data)
    })
}