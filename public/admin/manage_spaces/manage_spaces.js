let table;

window.onload = async function(){
    table =  new DataTable('#spaceTable', {
        searching: false,
        paging: false,
        ordering: false
    });
    await populateSpaceTable();

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
        row.push('<button class="edit-btn">Edit</button>');
        let node = table.row.add(row).draw().node();
    }
    table.draw();
}
$('#spaceTable').on('click', '.edit-btn', function () {
    let rowData = table.row($(this).parents('tr')).data();
    console.log('Editing:', rowData);

    window.location.href = `http://localhost:3000/admin/manage_spaces/edit?space=${rowData[0]}`
});