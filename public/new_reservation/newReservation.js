let startDatePicker;
let endDatePicker;

window.onload = async function(){
    initDatePickers();

    document.getElementById("searchBtn").onclick = searchAvailability;
}

function searchAvailability(){
    window.location.href = `http://localhost:3000/new_reservation/find_space/?start=${startDatePicker.selectedDates[0]}&end=${endDatePicker.selectedDates[0]}`;
}

function initDatePickers(){
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