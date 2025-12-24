window.onload = async function(){

    $("#siteForm").on("submit", async function (e){
        e.preventDefault();
        console.log("Submit")

        const formData = {
            size: $('#spaceSize').val(),
            daily: $('#dailyPrice').val(),
            weekly: $('#weeklyPrice').val(),
            monthly: $('#monthlyPrice').val(),
            type: $('#spaceType').val(),
            special: $('#special').val(),
            name: $('#spaceName').val()
        };
        console.log(formData)

        fetch("/api/spaces/edit", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data =>{
            if(data.success){
                alert("Changes saved succesfully")
            }
        })
        .catch(error => {
            console.log(error)
        })
    });

    $("#deleteSpace").on("click", async function (){
        fetch("/api/spaces/delete", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({"name": document.getElementById("spaceName").value})
        })
        .then(req => req.json())
        .then(data =>{
            console.log(data);

            if(data.success){
                window.location.replace("http://localhost:3000/admin/manage_spaces/")
            }
        })
        .catch(err => {
            console.log(err);
        })
    })
    

    data = await getSpaceData();

    document.getElementById("spaceName").value = data.name;
    document.getElementById("spaceSize").value = data.size;
    document.getElementById("spaceType").value = data.type;
    document.getElementById("dailyPrice").value = data.daily;
    document.getElementById("weeklyPrice").value = data.weekly;
    document.getElementById("monthlyPrice").value = data.monthly;
    document.getElementById("special").value = data.special;
}

async function getSpaceData(){
    let returnData;
    const urlParams = new URLSearchParams(window.location.search);

    const spaceName = urlParams.get('space')

    

    await fetch("/api/spaces/get_by_name", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({"name": spaceName})
    })
    .then(response => response.json())
    .then(data => {
        console.log(data)
        returnData = data[0]
    })
    return returnData;
}
