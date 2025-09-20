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

        if(status.error){
            alert(`Error: ${status.error}`)
        }
        else{
            alert("Space added succesfully")
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
        status = response.json()
        console.log(status)
    });
    return status
}