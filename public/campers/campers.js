let table;

window.onload = async function() {
    table = $('#reservationTable').DataTable({
        pageLength: 25,
        lengthMenu: false,
        order: [[0, 'asc']],
        columnDefs: [
            { orderable: false, targets: 4 } // Disable sorting on Action column
        ]
    });
    
    await appendTable();

}

 function toLocalDateOnly(str) {
     const [y, m, d] = str.split("-").map(Number);
     return new Date(y, m - 1, d);
 }
async function appendTable(){
    let camperList;

    const res = await fetch('/api/campers', {
        method: 'GET',
    })
    const resJson = await res.json();
    camperList = resJson;
    let row;
    for(let i=0; i<camperList.length; i++){
        // make dates easy to read for the hard working marina employee

        let camperRow = camperList[i];

        row = [camperRow.id, camperRow.first_name + " " + camperRow.last_name, camperRow.address1, camperRow.state, camperRow.city, camperRow.postal, camperRow.email, camperRow.phone];
        // append buttons
        row.push('<button class="edit-btn">Edit</button>', '<button class="delete-btn">Delete</button>');
        table.row.add(row);
    }
    table.draw();
}


function humanizeDate(dateStr){
    const date = new Date(toLocalDateOnly(dateStr).toString()); // parse the string
    

    // Options for formatting
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const humanReadable = date.toLocaleDateString('en-US', options);
    return humanReadable;
}

// Show button handler
$('#reservationTable').on('click', '.edit-btn', function () {
    let rowData = table.row($(this).parents('tr')).data();
    window.location.href = `http://localhost:3000/campers/edit?id=${rowData[0]}`;
});

// cancel button
$('#reservationTable').on('click', '.delete-btn', async function () {
    let rowData = table.row($(this).parents('tr')).data();
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
});
function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}