

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
    
    
    
    // If validation passes, process the form
    console.log('Form submitted with data:', data);
    const urlParams = new URLSearchParams(window.location.search);
    let redirectUrl = `http://localhost:3000/new_reservation/review_reservation/?firstName=${data.firstName}&lastName=${data.lastName}&address=${data.address}&address2=${data.address2}&city=${data.city}&state=${data.state}&zip=${data.zip}&email=${data.email}&phone=${data.phone}&boatName=${data.boatName}&boatLength=${data.boatLength}&space=${urlParams.get("space")}&start=${urlParams.get("start")}&end=${urlParams.get("end")}&type=${document.getElementById("rigType").value}`
    window.location.href = redirectUrl;
    
    // Here you would typically send the data to your server
    // For now, we'll just log it and show a success message
})
