

let idNumber;
let resStatus;

let dateStart;
let dateEnd;
let resPayment = 0;

const fieldMapping = {
  "startDate": "start",
  "endDate": "end",
  "firstName": "first_name", // Note: will need special handling since DB stores full name
  "lastName": "last_name",  // Note: will need special handling since DB stores full name
  "address": "address",
  "address2": "address2", 
  "city": "city",
  "state": "state",
  "zip": "postal",
  "phone": "phone",
  "email": "email",
  "boatName": "boat_name",
  "boatSize": "length",
  "rigType": "type"
};

window.onload = async function () {
    const urlParams = new URLSearchParams(window.location.search);
    idNumber = urlParams.get("number")

    console.log(urlParams);

    await populateFields(urlParams);

    await calcPrice(window); 
}


async function populateFields(data){
    console.log("HERE")
    let resData;
    await fetch("/api/reservations/get_by_id", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({"id": data.get("number")})
    })
    .then(res => res.json())
    .then(data => {
        resData = data;
        console.log(data)
        document.getElementById("startDate").value = data.start;
        document.getElementById("endDate").value = data.end;

        startDate = data.start
        endDate = data.end

        document.getElementById("firstName").value = data.first_name
        document.getElementById("lastName").value = data.last_name;

        document.getElementById("lastName").disabled = true;


        document.getElementById("address").value = data.address;
        document.getElementById("address2").value = data.address2;
        document.getElementById("city").value = data.city;

        document.getElementById("state").value = data.state;
        document.getElementById("state").disabled = true;

        document.getElementById("zip").value = data.postal;
        document.getElementById("phone").value = data.phone;
        document.getElementById("email").value = data.email;
        document.getElementById("boatName").value = data.boat_name;
        document.getElementById("boatSize").value = data.length;
        document.getElementById("rigType").value = data.type;

        resPayment = data.payment;
        
        let spaceTable = document.querySelector(".site-info-table");
        spaceTable.rows[1].cells[0].innerText = data.space;

        resStatus = data.status;
        if(resStatus == "occupied"){
            document.getElementById("checkButton").innerText = "Check Out Now"
        }
    })

    await fetch("/api/spaces", {
        method: "GET",
        headers: {"Content-Type": "applicaiton/json"}
    })
    .then(res => res.json())
    .then(spaceData =>{
        console.log(spaceData)
        const resSpace = spaceData.filter(inner => inner.name == resData.space);
        fillTable("spaceTable", [[resData.space, "", resSpace[0].size,resSpace[0].type, resSpace[0].special]], window)
    });

    console.log(resStatus);
    
}   
// Basic form functionality
function changeDates() {
    // Your date change logic here
    console.log("change Date")
    let spaceTable = document.querySelector(".site-info-table");
    let space = spaceTable.rows[1].cells[0].innerText;

    let redirectUrl = `http://localhost:3000/show_reservation/change_date?space=${space}&id=${idNumber}&start=${document.getElementById("startDate").value}&end=${document.getElementById("endDate").value}`
    window.location.href = redirectUrl;

}

function sendEmail() {
    // Your email logic here
}

function changeSpace() {
    // Your space change logic here
}

function completeReservation(){

    window.location.href = "http://localhost:3000"
}

async function checkInNow() {
    // Your check-in logic here
    let resID = new URLSearchParams(window.location.search).get("number")
    let msg = resStatus == "occupied" ? "out" : "in"
    if(confirm(`Confirm check ${msg} of reservation #${resID}?`)){
        
        let sendValue = resStatus == "occupied" ? "reserved":"occupied"

        await fetch("/api/reservations/update", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({id: resID, name: "status", value: sendValue})
        })
        .then(res => res.json())
        .then(data =>{
            if(data.success){
                if(sendValue == "reserved"){
                    alert("User checkout out")
                }
                else{
                    alert("User checked in")
                }
                
                window.location.href = "http://localhost:3000"
            }
        })
    }
}

// Auto-calculate dates and rates
 async function calcPrice(pageWindow, isPrint=false) {
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    const start = toLocalDateOnly(startDate.value);
    const end = toLocalDateOnly(endDate.value);

    console.log(start)
    console.log(end)
 
    const days = Math.floor((end - start) / (1000 * 60 * 60 * 24));
    console.log(days)
        
    let daysCalc = days;
    const monthlyRate = 400.00;
    const weeklyRate = 200.00;
    const dailyRate = 50.00;

    let monthCount = 0;
    let weekCount = 0;
    let dayCount = 0;

    while(true){
        if(daysCalc >= 30){ // month
            daysCalc -= 30
            monthCount += 1;
            continue;
        }
        else if(daysCalc >= 7){ // week
            daysCalc -= 7;
            weekCount += 1;
            continue;
        }   
        else if(daysCalc > 0){
            daysCalc -= 1;
            dayCount += 1;
            continue
        }
        else{
            break
        } 
    }
    let monthCost = monthlyRate*monthCount;
    let weekCost = weeklyRate*weekCount;
    let dayCost = dailyRate*dayCount;
    let total = monthCost + weekCost + dayCost;

    console.log(`Months: ${monthCount}`)
    console.log(`Weeks: ${weekCount}`)
    console.log(`Days: ${dayCount}`)

    let rateTableRows = []
    let monthDateEnd;
    let weekDateEnd;
    if(monthCount != 0){
        monthDateEnd = dateToStr(addDays(startDate.value, 30 * monthCount));
        rateTableRows.push(["Monthly",startDate.value, (monthDateEnd), monthCount.toString(),"$"+monthlyRate.toFixed(2), "$"+monthCost.toFixed(2)])
    }
    if(weekCount!=0){
        let tmpStart = monthDateEnd ? monthDateEnd : startDate.value;
        weekDateEnd = dateToStr(addDays(tmpStart, weekCount*7))
        rateTableRows.push(["Weekly",(tmpStart), (weekDateEnd), weekCount.toString(),"$"+weeklyRate.toFixed(2), "$"+weekCost.toFixed(2)])
    }
    if(dayCount != 0){
        let tmpStart = weekDateEnd ? weekDateEnd : (monthDateEnd ? monthDateEnd : startDate.value);
        let dayDateEnd = dateToStr(addDays(tmpStart, dayCount));
        rateTableRows.push(["Daily",tmpStart, (dayDateEnd), dayCount.toString(),"$"+dailyRate.toFixed(2), "$"+dayCost.toFixed(2)])
    }
    rateTableRows.push(["Total","","","","","$"+total.toFixed(2)])

    let payment = 0;
    await fetch("/api/payments", {
        method: "GET",
        headers: {"Content-Type": "application/json"}
    })
    .then(res => res.json())
    .then(data => {
        const paymentData = data.filter(element => element.id == idNumber);
        paymentData.forEach(element => {
            let paymentFloat = parseFloat(element.amount)
            payment += paymentFloat;
            if(!isPrint)
                rateTableRows.push([element.type + " Payment", element.date, element.date, "","", "$" +paymentFloat.toFixed(2)])
        });
    })
    if(payment > 0)
        rateTableRows.push(["Total Payment","","","","","$"+ (payment).toFixed(2)])
    rateTableRows.push(["Amount Owed","","","","","$"+ (total - payment).toFixed(2)])
    
    fillTable("rateTable", rateTableRows, pageWindow)


    //rateRow.cells[5].textContent = `$${total.toFixed(2)}`;
    
    // Update totals
    //const totalRow = document.querySelector('.rate-table tbody tr:nth-child(2)');
    //const amountDueRow = document.querySelector('.rate-table tbody tr:nth-child(3)');
    //totalRow.cells[5].textContent = `$${total.toFixed(2)}`;
    //amountDueRow.cells[5].textContent = `$${total.toFixed(2)}`;
}
    

function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
    });
}

function cancelReservation(){
    if(confirm(`Confirm cancellation of reservation #${idNumber}?`)){
        fetch("/api/reservations/delete", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({id: idNumber})
        })
        .then(res => res.json())
        .then(data => {
            if(data.success){
                window.location.href = "http://localhost:3000"
            }
            else if(data.error){
                alert(data.err)
            }
        })
    }
}

function toggleEdit(fieldId, button) {
const field = document.getElementById(fieldId);
if (field.disabled) {
    field.disabled = false;
    field.focus();
    button.textContent = 'Save';
    button.className = 'save-btn';
    button.setAttribute('onclick', `saveField('${fieldId}', this)`);
}
}

function toggleEditSelect(fieldId, button) {
    const field = document.getElementById(fieldId);
    if (field.disabled) {
        field.disabled = false;
        field.focus();
        button.textContent = 'Save';
        button.className = 'save-btn';
        button.setAttribute('onclick', `saveSelectField('${fieldId}', this)`);
        }
}

function toggleEditTextarea(fieldId, button) {
    const field = document.getElementById(fieldId);
    if (field.disabled) {
        field.disabled = false;
        field.focus();
        button.textContent = 'Save';
        button.className = 'save-btn';
        button.setAttribute('onclick', `saveTextareaField('${fieldId}', this)`);
        }
}

function saveField(fieldId, button) {
    const field = document.getElementById(fieldId);
    field.disabled = true;
    button.textContent = 'Edit';
    button.className = 'edit-btn';
    button.setAttribute('onclick', `toggleEdit('${fieldId}', this)`);
    console.log(`${field.id} changed to: ${field.value}`)


    if(fieldId )
    fetch("/api/reservations/update", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            id: idNumber,
            name: fieldMapping[fieldId],
            value: field.value
        })
    })
}


// Handle Enter key to save field
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT' && !e.target.disabled) {
        const button = e.target.parentElement.querySelector('.save-btn');
        if (button) {
            button.click();
        }
    }
});

function saveSelect(fieldID){
    let selectValue = document.getElementById(fieldID).value;
    console.log(selectValue)
    
    if(selectValue == "none"){
        console.log("HELPPPP MEEEE");
        window.document.getElementById("paymentContainer").style = "display: none;";
    }
    else{
        window.document.getElementById("paymentContainer").style = "";
    }

}
async function paymentSubmit(fieldID){
    let paymentAmount = document.getElementById(fieldID).value;
    
    if(!paymentAmount){
        alert("Payment amount must be a number");
        return;
    }

    await fetch("/api/payments", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({"id": idNumber, "amount": paymentAmount, "type": document.getElementById("paymentType").value, "date": dateToStr(new Date())})
    })
    .then(res => res.json())
    .then(data => {
        if(data.error){
            console.log(data.error)
        }
    })

    let rateTable = document.getElementById("rateTable");

    while(rateTable.rows.length > 1){
        rateTable.deleteRow(1);
    }
    await populateFields(new URLSearchParams(window.location.search))
    calcPrice(window);
    window.document.getElementById("paymentContainer").style = "display: none;";
    document.getElementById("paymentType").value = "none"

}

async function printRes(){
    const response = await fetch("print.html")
    let template = await response.text();

    console.log(template)
    //document.body.innerHTML = template

    
    const printWindow = await window.open('', '', 'width=800,height=800');
    await printWindow.document.write(template);
    await printWindow.document.close();

    let resData;
    printWindow.onload = async () =>{
        printWindow.focus();
        await fetch("/api/reservations/get_by_id", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({"id": idNumber})
        })
        .then(res => res.json())
        .then(data => {
            resData = data;
            console.log(data)
            printWindow.document.getElementById("start").innerText = data.start;
            printWindow.document.getElementById("end").innerText = data.end;

            // Customer info
            printWindow.document.getElementById("name").innerText = data.first_name + " " + data.last_name;
            printWindow.document.getElementById("address1").innerText = data.address;
            printWindow.document.getElementById("address2").innerText = data.address2;
            printWindow.document.getElementById("city").innerText = data.city;
            printWindow.document.getElementById("state").innerText = data.state;
            printWindow.document.getElementById("postal").innerText = data.postal;
            printWindow.document.getElementById("number").innerText = data.phone;
            printWindow.document.getElementById("email").innerText = data.email;

            // Boat info
            printWindow.document.getElementById("boatName").innerText = data.boat_name;
            printWindow.document.getElementById("boatSize").innerText = data.length ? data.length +"ft": "";
            printWindow.document.getElementById("rigType").innerText = data.type;

            calcPrice(printWindow, true); // fill rateInfi

           
        });

        await fetch("/api/spaces", {
            method: "GET",
            headers: {"Content-Type": "applicaiton/json"}
        })
        .then(res => res.json())
        .then(spaceData =>{
            console.log(spaceData)
            const resSpace = spaceData.filter(inner => inner.name == resData.space);
            fillTable("spaceTable", [[resData.space, "", resSpace[0].size,resSpace[0].type, resSpace[0].special]], printWindow)
        });
        printWindow.print();
        printWindow.close();
    }
   


}

function fillTable(tableId, rows, pageWindow) {
    let tbody = pageWindow.document.getElementById(tableId).querySelector("tbody");
    tbody.innerHTML = ""; // clear existing
    rows.forEach(row => {
        let tr = pageWindow.document.createElement("tr");
        row.forEach(cell => {
            let td = pageWindow.document.createElement("td");
            td.textContent = cell;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

function toLocalDateOnly(str) {
     const [y, m, d] = str.split("-").map(Number);
     return new Date(y, m - 1, d);
 }

function dateToStr(date) {
  let year = date.getFullYear();
  let month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-based
  let day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

 function addDays(date, days) {
     const result = toLocalDateOnly(date);
     result.setDate(result.getDate() + days);
     return result;
 }
