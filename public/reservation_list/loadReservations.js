let table;

window.onload = async function() {
    
    table = new DataTable('#reservationTable');
    table.searching = true;
    table.order([1, 'desc']).draw()
    await appendTable();

}

 function toLocalDateOnly(str) {
     const [y, m, d] = str.split("-").map(Number);
     return new Date(y, m - 1, d);
 }
async function appendTable(){
    let reservationList;

    await fetch('/api/reservations', {
        method: 'GET',
    })
    .then(res => res.json())
    .then(data =>{
        reservationList = data;
    })

    let row;
    for(let i=0; i<reservationList.length; i++){
        // make dates easy to read for the hard working marina employee

        let resRow = reservationList[i]

        if(resRow.status != "reserved"){
            continue;
        }


        let startDate = toLocalDateOnly(resRow.start);
        let endDate = toLocalDateOnly(resRow.end)

        resRow["start"] = humanizeDate(reservationList[i]["start"])
        resRow["end"] = humanizeDate(reservationList[i]["end"])

        
        let now = new Date();
        

        let payment = 0;
        await fetch("/api/payments", {
            method: "GET",
            headers: {"Content-Type": "application/json"}
        })
        .then(res => res.json())
        .then(data => {
            const paymentData = data.filter(element => element.id == resRow.id);
            paymentData.forEach(element => {
                let paymentFloat = parseFloat(element.amount)
                payment += paymentFloat;
            });
        });
        
        console.log(resRow.due)
        let dueStr = "$"+ (parseFloat(resRow.due) - payment).toFixed(2);
        let paymentStr = "$" + payment.toFixed(2);

        row = [resRow.id, resRow.start, resRow.end, resRow.first_name + " " + resRow.last_name, resRow.type, resRow.length, resRow.space, paymentStr, dueStr]
        // append buttons
        row.push('<button class="show-btn">Show</button>', '<button class="check-in-btn">Check in</button>', '<button class="cancel-btn">Cancel</button>');
        let node = table.row.add(row).draw().node();
        console.log(startDate)
        if(now > startDate){ // will use for checking in and overdue in future
            $(node).css('background-color', 'yellow');
        }
        if(isSameDay(now, startDate)){
            $(node).css('background-color', "lightgreen");
        }
    }
    table.draw();
}
async function writeReservationDB(customerData){
    await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
    });
}

function humanizeDate(dateStr){
    const date = new Date(toLocalDateOnly(dateStr).toString()); // parse the string
    

    // Options for formatting
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const humanReadable = date.toLocaleDateString('en-US', options);
    return humanReadable;
}

// Show button handler
$('#reservationTable').on('click', '.show-btn', function () {
    let rowData = table.row($(this).parents('tr')).data();
    window.location.href = `http://localhost:3000/show_reservation/?number=${rowData[0]}`
    console.log('Editing:', rowData);
});

// Check in button
$('#reservationTable').on('click', '.check-in-btn', async function () {
    let rowData = table.row($(this).parents('tr')).data();

    if(confirm(`Confirm check in of reservation #${rowData[0]}`)){
        await fetch("/api/reservations/update", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({id: rowData[0], name: "status", value: "occupied"})
        })
        .then(res => res.json())
        .then(data =>{
            if(data.success){
                window.location.reload();
            }
        })
    }
});

// cancel button
$('#reservationTable').on('click', '.cancel-btn', function () {
    let rowData = table.row($(this).parents('tr')).data();
    
    if(confirm(`Confirm cancellation of reservation #${rowData[0]}?`)){
        fetch("/api/reservations/delete", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({id: rowData[0]})
        })
        .then(res => res.json())
        .then(data => {
            if(data.success){
                location.reload();
            }
            else if(data.error){
                alert(data.err)
            }
        })
    }
});
function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}