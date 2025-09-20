let table;

window.onload = async function(){

    table = new DataTable('#spaceTable', {
        searching: false,
        paging: false,
        ordering: false
    });

    const urlParams = new URLSearchParams(window.location.search);

    const startStr = urlParams.get('start')
    const endStr = urlParams.get('end')

    if(startStr == "undefined" || endStr == "undefined"){
        alert("Start or end date missing!")
        window.location.href = window.history.back();
    }


    await populateSpaceTable(startStr, endStr);
    const startDate = new Date(startStr);
    const endDate = new Date(endStr);

}
async function populateSpaceTable(startStr, endStr){
    let spaceList

    await fetch('/api/spaces', {
        method: 'GET',
    })
    .then(res => res.json())
    .then(data =>{
        spaceList = data;
    })

    let row;
    for(let i=0; i<spaceList.length; i++){
        // make dates easy to read for the hard working marina employee
        console.log(spaceList[i].name)
        await fetch('/api/spaces/available', {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({id: -1, space: spaceList[i].name, start: startStr, end: endStr})
        })
        .then(res => res.json())
        .then(data => {
            if(data.free){
                row = Object.values(spaceList[i]);
                // append buttons
                row.push('<button class="select-btn">Select</button>');
                table.row.add(row).draw();
            }
        })
    }
    table.draw();
}

$('#spaceTable').on('click', '.select-btn', function () {
    let rowData = table.row($(this).parents('tr')).data();
    const urlParams = new URLSearchParams(window.location.search);
    window.location.href = `http://localhost:3000/new_reservation/enter_information?space=${rowData[0]}&start=${urlParams.get("start")}&end=${urlParams.get("end")}`
});
