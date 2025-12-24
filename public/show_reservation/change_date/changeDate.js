let startDatePicker;
let endDatePicker;

let space;
let id;
window.onload = async function(){

    const urlParams = new URLSearchParams(window.location.search);

    space = urlParams.get("space")
    id = urlParams.get("id")

    let startDate = toLocalDateOnly(urlParams.get("start"))
    let endDate = toLocalDateOnly(urlParams.get("end"))

    
    initDatePickers(startDate, endDate);

    startDatePicker.setDate(startDate);
    endDatePicker.setDate(endDate);
    
}
 function toLocalDateOnly(str) {
     const [y, m, d] = str.split("-").map(Number);
     return new Date(y, m - 1, d);
 }

function initDatePickers(startDate, endDate){
    startDatePicker = flatpickr("#startDate", {
        dateFormat: "Y-m-d",
        inline: true,
        onChange: function(selectedDates, dateStr, instance) {
            // Update the display
            let currentDay = new Date(selectedDates[0]);

            // if end date is less than start of end date has not been selected
            if((currentDay >= new Date(endDatePicker.selectedDates[0])) || (!endDatePicker.selectedDates[0])){
                console.log("More")
                currentDay.setDate(currentDay.getDate() + 1);
                endDatePicker.setDate(currentDay);
            }
            
            //document.getElementById('startDateDisplay').textContent = dateStr || 'Not selected';
            const searchButton = document.getElementById("searchBtn");
            searchButton.disabled = false;
            searchButton.classList.remove("disabledButton");
        }
    });

// Initialize the end date picker
    endDatePicker = flatpickr("#endDate", {
        dateFormat: "Y-m-d",
        inline: true,
        onChange: function(selectedDates, dateStr, instance) {
            let currentDay = new Date(selectedDates[0]);

            if(!startDatePicker.selectedDates[0] || currentDay <= new Date(startDatePicker.selectedDates[0])){
                currentDay.setDate(currentDay.getDate() -1);
                startDatePicker.setDate(currentDay);
            }

            const searchButton = document.getElementById("searchBtn");
            searchButton.disabled = false;
            searchButton.classList.remove("disabledButton");
        }
    });
}

function formatDate(date){
    let yyyy = date.getFullYear();
    let mm = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-based
    let dd = String(date.getDate()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd}`;
}

async function submitChange(){

    let newDateStart = formatDate(startDatePicker.selectedDates[0]);
    let newDateEnd = formatDate(endDatePicker.selectedDates[0]);

    let escape = false;
    await fetch("/api/spaces/available", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({"space": space, "id": id, "start": newDateStart, "end": newDateEnd})
    })
    .then(res => res.json())
    .then(data =>{

        if(!data.free){
            escape = true
            showErrortext();
        }

    })

    if(escape){
        return
    }

    await fetch("/api/reservations/update", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({id: id, name: "start", value: newDateStart})
    })
    .then(res => res.json())
    .then(data => {
        console.log(data)
        if(!data.success){
            alert("date change failed")
            return;
        }
    })

    await fetch("/api/reservations/update", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({id: id, name: "end", value: newDateEnd})
    })
    .then(res => res.json())
    .then(data => {
        console.log(data)
        if(!data.success){
            alert("date change failed")
            return;
        }
    })
    alert("Date change success!")
    window.location.href = `http://localhost:3000/show_reservation/?number=${id}`
}
async function showErrortext(){
    document.getElementById("failText").hidden = false;
    setTimeout(() => {
        document.getElementById("failText").hidden = true;
    }, 3000)
    
}