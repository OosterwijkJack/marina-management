
 let reservationList = []
 let spaceList = []

 let currentDate = new Date();

 function formatDate(date) {
     return date.toLocaleDateString('en-US', {
         //weekday: 'short',
         day: 'numeric',
        // month: 'short'
     }).toUpperCase();
 }
 function dateToStr(date) {
  let year = date.getFullYear();
  let month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-based
  let day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

 function toLocalDateOnly(str) {
     const [y, m, d] = str.split("-").map(Number);
     return new Date(y, m - 1, d);
 }

 function addDays(date, days) {
     const result = new Date(date);
     result.setDate(result.getDate() + days);
     return result;
 }

 function getDateRange() {
     let smallestDate;
     let largestDate;

     reservationList.forEach(res => {
        if (!res.start || !res.end || res.status == "complete") return;

        let startDate = new Date(toLocalDateOnly(res.start).toString());
        let endDate = new Date(toLocalDateOnly(res.end).toString());
        console.log(res)

        if (!smallestDate || !largestDate) {
            smallestDate = startDate;
            largestDate = endDate;
            return;
        }

        if (startDate < smallestDate) {
            smallestDate = startDate;
        }
        if (endDate > largestDate) {
            largestDate = endDate;
        }
     });

     // Default range if no reservations
     if (!smallestDate || !largestDate) {
         smallestDate = new Date();
         largestDate = addDays(new Date(), 14);
     }

     let days = ((largestDate - smallestDate) / (1000 * 60 * 60 * 24)) + 1;

     let minDays = 60;
     if(days < minDays){
        largestDate = addDays(largestDate, minDays-days)
        days = ((largestDate - smallestDate) / (1000 * 60 * 60 * 24)) + 1;
     }
     console.log(smallestDate)
     return {
         startDate: smallestDate,
         endDate: largestDate,
         days
     };
 }

 function generateDateSlots() {
     let dateData = getDateRange();
     const slots = [];

     for (let i = 0; i < dateData.days; i++) {
         const d = addDays(dateData.startDate, i);
         slots.push({
             key: d.toISOString().split('T')[0],
             label: formatDate(d)
         });
     }
     return slots;
 }


 // Generate date slots

let dateSlots;
 function buildHeaders(dateSlots){
     const headerRow = document.getElementById("headerRow");
     dateSlots.forEach(slot => {
     const th = document.createElement("th");
     th.textContent = slot.label;
     th.dataset.date = slot.key;
     headerRow.appendChild(th);
 });
 }


 class ReservationManager {
     constructor() {
         this.reservations = new Map();
     }

     addReservation(resourceId, startDate, endDate, guestName,resID, status) {
        if(status != "occupied" && status != "reserved"){
            return
        }

        const tmpDate = new Date(toLocalDateOnly(endDate).toString())
        endDate = dateToStr(addDays(tmpDate, -1))

        const startIndex = dateSlots.findIndex(s => s.key === startDate);
        const endIndex = dateSlots.findIndex(s => s.key === endDate);

        // only display last name for res that lasts 1 day
        if(endIndex - startIndex == 0){
            guestName = guestName.split(" ")[1]
        }
        if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) return;

        //resourceId = spaceList[spaceList.indexOf(resourceId)-1]
        const row = document.querySelector(`[data-resource="${resourceId}"]`);
        console.log(row)
        
        if (!row) return;

        const grid = row.querySelector(".row-dates");
        console.log(grid)
        if (!grid) return;

        const bar = document.createElement("div");
        bar.className = `reservation-bar status-${status}`;
        bar.textContent = guestName;
        bar.style.gridColumn = `${startIndex + 1} / ${endIndex + 2}`; // grid columns are 1-based
        bar.style.gridRow = "1/2"
        bar.id = resID

        bar.addEventListener("click", () => {
            window.location.href = `http://localhost:3000/show_reservation/?number=${bar.id}`
        });

        grid.appendChild(bar);
        const id = `res_${Date.now()}_${Math.random().toString(36).substr(2,9)}`;
        this.reservations.set(id, {
            resourceId,
            startDate,
            endDate,
            guestName,
            element: bar
        });

        return id;
     }

     clearAll() {
         this.reservations.forEach(r => r.element.remove());
         this.reservations.clear();
     }

     addResource(name, id) {
         const tableBody = document.getElementById("tableBody");
         const tr = document.createElement("tr");
         tr.dataset.resource = id;

         const labelCell = document.createElement("td");
         labelCell.textContent = name;
         tr.appendChild(labelCell);

         const datesCell = document.createElement("td");
         datesCell.className = "dates-container";
         datesCell.colSpan = dateSlots.length;

         const grid = document.createElement("div");
         grid.className = "row-dates";
         grid.style.setProperty("--num-dates", dateSlots.length+1);

         dateSlots.forEach(() => {
             const slot = document.createElement("div");
             grid.appendChild(slot);
         });

         datesCell.appendChild(grid);
         tr.appendChild(datesCell);
         tableBody.appendChild(tr);
     }
 }

 const reservationManager = new ReservationManager();



 // Initialize resources
 document.addEventListener('DOMContentLoaded', async function() {

    await fetch("/api/reservations", {
        method: "GET",
        headers: {"Content-Type": "application/json"}
    })
    .then(res => res.json())
    .then(data => {
        reservationList = data
    })
    await fetch("/api/spaces", {
        method: "GET",
        headers: {"Content-Type": "application/json"}
    })
    .then(res => res.json())
    .then(data => {
        spaceList = data
    })

    console.log(reservationList)
    dateSlots = generateDateSlots();
    buildHeaders(dateSlots)

    spaceList.forEach(space => {
        console.log(space)
        reservationManager.addResource(space.name, space.name);
    });

    reservationList.forEach(res => {
        let name = res.first_name + " " + res.last_name
        console.log(res.status)
        reservationManager.addReservation(res.space, res.start, res.end, name, res.id, res.status)
        //first = false;
        
    })
    
 });