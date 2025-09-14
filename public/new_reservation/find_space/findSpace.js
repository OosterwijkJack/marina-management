let table;

window.onload = async function(){

    table = new DataTable('#spaceTable', {
        searching: false,
        paging: false
    });

    await populateSpaceTable();

    const urlParams = new URLSearchParams(window.location.search);

    const startStr = urlParams.get('start')
    const endStr = urlParams.get('end')

    if(startStr == "undefined" || endStr == "undefined"){
        alert("Start or end date missing!")
        window.location.href = window.history.back();
    }

    const startDate = new Date(startStr);
    const endDate = new Date(endStr);

}
async function populateSpaceTable(){
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
        
        row = Object.values(spaceList[i]);
        // append buttons
        row.push('<button class="select-btn">Select</button>');
        let node = table.row.add(row).draw().node();
    }
    table.draw();
}

$('#spaceTable').on('click', '.select-btn', function () {
    let rowData = table.row($(this).parents('tr')).data();
    const urlParams = new URLSearchParams(window.location.search);
    window.location.href = `http://localhost:3000/new_reservation/enter_information?space=${rowData[0]}&start=${urlParams.get("start")}&end=${urlParams.get("end")}`
});
