let userTable;
let customerList = []
let saveCustomerData = true;
let lastSelectedID;
let lastUser;

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
    if(saveCustomerData){
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
    }   
    else{
        let afterList = {
            "first_name": document.getElementById("firstName").value,
            "last_name": document.getElementById("lastName").value,
            "address1": document.getElementById("address").value,
            "address2": document.getElementById("address2").value,
            "city": document.getElementById("city").value,
            "state": document.getElementById("state").value,
            "postal": document.getElementById("zip").value,
            "phone": document.getElementById("phone").value,
            "email": document.getElementById("email").value,
            "boat_name": document.getElementById("boatName").value,
            "boat_size": document.getElementById("boatLength").value,
            "boat_type": document.getElementById("boatLength").value,
            "id": lastSelectedID
        }
        if(hasChanged(afterList)){
            if(confirm("Would you like to save changes to existing selected customer (\"Ok\" for yes \"Cancel\" for no)?")){

                await fetch("/api/campers/update", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(afterList)
                })
                .then(res => res.json())
                .then(data =>{
                    if(data.error){
                        alert(`error saving customer data\n${data.error}`)
                    }
                })
            }
        }
    }
    
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

function selectUser(user) {
    console.log("USER: ")
    console.log(user)
    if (user) {
        lastUser = user;
        // Fill the form with user data
        document.getElementById('firstName').value = user.first_name || '';
        document.getElementById('lastName').value = user.last_name || '';
        document.getElementById('address').value = user.address1 || '';
        document.getElementById('address2').value = user.address2 || '';
        document.getElementById('city').value = user.city || '';
        document.getElementById('state').value = user.state || '';
        document.getElementById('zip').value = user.postal || '';
        document.getElementById('phone').value = user.phone || '';
        document.getElementById('email').value = user.email || '';
        document.getElementById('boatName').value = user.boat_name || '';
        document.getElementById('boatLength').value = user.boat_size || '';
        document.getElementById('rigType').value = user.boat_type || 'Sail Boat';
        
        // Update field styling for filled fields
        const inputs = document.querySelectorAll('#reservationForm input[required]');
        inputs.forEach(input => {
            if (input.value.trim() !== '') {
                input.style.borderColor = '#4CAF50';
            }
        });
        saveCustomerData = false;
    }
    hasChanged(user)
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
        pageLength: 10,
        lengthMenu: [10, 25, 50, 100],
        order: [[0, 'asc']],
        columnDefs: [
            { orderable: false, targets: 4 } // Disable sorting on Action column
        ]
    });
});

$('#usersTable').on('click', '.btn-select', async function () {
    let rowData = userTable.row($(this).parents('tr')).data();
    lastSelectedID = rowData[0];
    
    await fetch("/api/camper/id", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({"id": rowData[0]})
    })
    .then(res => res.json())
    .then(data => {
        console.log(data[0])
        selectUser(data[0])
    })
});

$('#usersTable').on('click', '.btn-delete', async function () {
    let rowData = userTable.row($(this).parents('tr')).data();
    if(!confirm(`Confirm deletion of customer ${rowData[1]}?`)){
        return;
    }

    await fetch("/api/campers/delete", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({"id": rowData[0]})
    })
    .then(res => res.json())
    .then(data =>{
        if(data.error){
            alert("error deleting camper\n" + data.error)
        }
    })
   searchExistingUser("lastName"); // reload
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
async function searchExistingUser(inputID){
    //let row = ["2","Jack Oosterwijk", "Oosterwijkcools@gmail.com", "9022988912", "Mahone Bay","<button class='btn btn-select'>Select</button>" ]
    //let node = userTable.row.add(row).draw().node();

    let lastName = document.getElementById(inputID).value
    customerList = [] // reset list
    userTable.clear().draw();
    
     const res = await fetch("/api/campers/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lastName })
    });

    const data = await res.json();

    data.forEach(customer => {
        customerList.push(customer);
        let row = [
            customer.id,
            customer.first_name + " " + customer.last_name,
            customer.email,
            customer.phone,
            customer.city,
            "<button class='btn btn-select'>Select</button>",
            "<button class='btn btn-delete'>Delete</button>"
        ];
        userTable.row.add(row);
    });

    userTable.draw();
        
}
function hasChanged(user){
    let userAfterValues = Object.values(user);
    let userBeforeValues = Object.values(lastUser);
    console.log(userBeforeValues);
    console.log(userAfterValues);
    for(let i = 0; i < userAfterValues.length; i++){
        if(userAfterValues[i] != userBeforeValues[i]){
            return true;
        }
    }
    return false;
}
