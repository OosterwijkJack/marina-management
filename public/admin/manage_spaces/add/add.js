window.onload = function() {
    $('#siteForm').on('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            size: $('#spaceSize').val(),
            daily: $('#dailyPrice').val(),
            weekly: $('#weeklyPrice').val(),
            monthly: $('#monthlyPrice').val(),
            type: $('#spaceType').val(),
            special: $('#special').val(),
            name: $('#spaceName').val()
        };
        
        // Basic validation
        if (!formData.name) {
            alert('Please fill in name field!');
            return;
        }
        
        console.log('Form data:', formData);

        let status = await writeSpaceDB(formData);

        if(status === 200)
            alert('Space added successfully!');
        else{
            alert("Error adding space")
        }
        
        // Reset form
        this.reset();
    });
}
async function writeSpaceDB(spaceData){
    let status = 0
    await fetch('/api/spaces/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(spaceData)
    })
    .then(response => {
        status = response.status
        console.log(response.status)
    });
    return status
}