let UserID;

window.onload = async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const camperId = urlParams.get('id');
    userID = camperId;
    if (camperId) {
        let data = await fetchCamperData(camperId);
        selectUser(data[0]);
    } else {
        alert('No camper ID provided in the URL.');
    }
}

function cancelChange(){
    window.location.href = 'http://localhost:3000/campers';
}
async function fetchCamperData(id) {
    const cust = await fetch("/api/camper/id", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({"id": id})
    })
    let data = await cust.json();
    return data;
}
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
    }
}
async function saveChanges(){
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
        "id": userID
    }
    console.log(afterList)
    if(confirm("Confirm saving changes to customer data?")){

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
            else{
                alert("Customer data saved successfully.")
            }
        })
    }
    
}