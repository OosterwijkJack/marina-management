const express = require('express');
const knex = require('knex');
const favicon = require("serve-favicon");
const XLSX = require("xlsx");

const masterDB = knex({
  client: 'sqlite3',
  connection: {filename: './databases/MasterDatabase.db'},
  useNullAsDefault: true
});

const app = express();
const port = 3000;

app.use(express.static('public'))
app.use(express.json());
app.use(favicon(__dirname + "/public/favicon.ico"));

app.get('/reservations', (reg, res) => {
    res.sendFile(__dirname + "/public/reservation_list/index.html")
})
app.get('/new_reservation', (reg, res) => {
    res.sendFile(__dirname + "/public/new_reservation/index.html")
})
app.get('/', (reg, res) => {
    res.sendFile(__dirname + "/public/reservation_list/index.html")
})
app.get("/new_reservation/find_space", (reg, res)=>{
    res.sendFile(__dirname + "/public/new_reservation/find_space/index.html")
})
app.get("/new_reservation/enter_information", (reg, res)=>{
    res.sendFile(__dirname + "/public/new_reservation/enter_information/index.html")
})
app.get("/new_reservation/review_reservation", (reg, res)=>{
    res.sendFile(__dirname + "/public/new_reservation/review_reservation/index.html")
})

app.get("/admin", (req, res) =>{
    res.sendFile(__dirname + "/public/admin/index.html")
})
app.get("/admin/manage_spaces", (req, res)=>{
    res.sendFile(__dirname + "/public/admin/manage_spaces/index.html")
})
app.get("/admin/manage_spaces/add", (req, res)=>{
    res.sendFile(__dirname + "/public/admin/manage_spaces/add/index.html")
})
app.get("/admin/manage_spaces/edit", (req, res)=>{
    res.sendFile(__dirname + "/public/admin/manage_spaces/edit/index.html")
})

app.get("/campers", (req, res) =>{
    res.sendFile(__dirname + "/public/campers/index.html")
})
app.get("/show_reservation", (req, res) =>{
    res.sendFile(__dirname + "/public/show_reservation/index.html")
})

app.get("/show_reservation/change_date", (req, res) =>{
    res.sendFile(__dirname + "/public/show_reservation/change_date/index.html")
})

app.get("/site_availability", (req,res) =>{
    res.sendFile(__dirname + "/public/site_availability/index.html")
})
app.get("/in_park", (req, res) => {
    res.sendFile(__dirname + "/public/in_park_list/index.html")
})
app.get("/campers/edit", (req, res) =>{
    res.sendFile(__dirname + "/public/campers/edit/index.html")
});

try{
    app.listen(port, () =>{
        console.log(`Server running at http://localhost:${port}`)
    })
}
catch(err){
    console.log(err)
}




app.post("/api/reservations/update/payment", async (req,res)=>{
    try{
        await masterDB('reservations')
        .where("id", req.body.id)
        .update({
            payment: masterDB.raw('?? + ?', ["payment", parseInt(req.body.payment, 10)])
        })
        res.json({success: "true"})
    }
    catch(err){
        res.status(500).json({error: err.message})
    }
})
    

app.post('/api/reservations/update', async (req, res) => {
    try {
         await masterDB('reservations')
        .where("id", req.body.id)
        .update(req.body.name, req.body.value)

        res.json({success: "true"});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/reservations', async (req, res) => {
    try {
        const reservations = await masterDB('reservations').select('*');
        res.json(reservations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// API to add a reservation
app.post('/api/reservations', async (req, res) => {
    try {
        const [id] = await masterDB('reservations').insert(req.body);
        res.json({ success: true, id: id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/reservations/delete", async (req,res) => {
    try{
        await masterDB('reservations').where("id", req.body.id).delete();
        res.json({success: true});
    }
    catch(err){
        res.json({error: err.message})
    }
})

app.post('/api/reservations/get_by_id', async (req,res) =>{
    try{
        const reservation = await masterDB("reservations").where("id", req.body.id).first();
        res.json(reservation);
    }
    catch(err){
        res.status(500).json({error:err.message})
    }
})

app.get("/api/spaces/", async (req, res) => {
  try {
    const spaces = await masterDB('spaces')
      .select('*')
      .orderByRaw(`
        CASE 
          WHEN name LIKE 'M%' 
          THEN CAST(SUBSTR(name, 2) AS INTEGER) 
          ELSE NULL 
        END ASC, name ASC
      `);

    res.json(spaces);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post("/api/spaces/get_by_name", async (req, res)=>{
    try {
        const spaces = await masterDB('spaces').select('*').where("name", req.body.name);
        res.json(spaces);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

app.post("/api/spaces/add", async (req,res) => {
    try{
        const dup = await masterDB("spaces").select("*").where("name", req.body.name)
        if(dup.length > 0){
            res.status(500).json({error: "Can not add duplicate space."})
            return;
        }
        await masterDB("spaces").insert(req.body);
        res.json({success: true})
    }
    catch(err){
        res.status(500).json({error: err.message})
    }
})
app.post("/api/spaces/edit", async (req, res) =>{
    try{
        await masterDB("spaces")
        .update({
            size: req.body.size,
            type: req.body.type,
            daily: req.body.daily,
            weekly: req.body.weekly,
            monthly: req.body.monthly,
            special: req.body.special
        })
        .where("name", req.body.name)
        res.json({success: true})
    }
    catch(err){  
        res.json({error: err.message})
    }
});

app.post("/api/spaces/delete", async(req, res) =>{
    try{
        await masterDB("spaces")
        .where("name", req.body.name)
        .limit(1)
        .del();
        res.json({success: true})
    }
    catch(err){
        res.json({error: err.message})
    }
})
async function isAvailable(space, start, end, id){
    let newStartDate = toLocalDateOnly(start);
    let newEndDate = toLocalDateOnly(end);


    const reservations = await masterDB('reservations').select('*')

    let free = true;
    reservations.forEach(res => {
        let startDate = toLocalDateOnly(res.start);
        let endDate = toLocalDateOnly(res.end);

        // only check same spaces and different res
        if(res.space != space || res.id == id || free == false || res.status == "complete"){
            return
        }

        // check for date collision 
        if((newStartDate < endDate) && (newEndDate > startDate)) {
            free = false;
        }
    });

    return free;
}
app.post("/api/spaces/available", async(req, res) => {
    try{
        if(isAvailable(req.body.space, req.body.start, req.body.end, req.body.id)){
            res.json({"free": true})
        }
        else{
            res.json({"full": true})
        }
    }
    catch(err){
        res.status(500).json({error: err.message})
    }
    
})

app.post("/api/spaces/available/bulk", async(req, res) => {

    try{

        let data = req.body;
        let isFreeList = [];
        for(let i = 0; i<data.length; i++){
            let free = await isAvailable(data[i].space, data[i].start, data[i].end, data[i].id);
            isFreeList.push({"free":free});
        }
    
        res.json(isFreeList);
        return;
    }
    catch(err){
        res.status(500).json({error: err.message})
    }
})

app.post("/api/payments", async (req,res) => {
    try{
        await masterDB("payments").insert(req.body);
        res.json({"success": true});
    }
    catch(err){
        res.status(500).json({error: err.message})
    }
})
app.get("/api/payments", async(req, res)=>{
    try {
        const payments = await masterDB('payments').select('*');
        res.json(payments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

app.post("/api/campers/add", async (req,res) => {
    try{
        await masterDB("campers").insert(req.body);
        res.json({success: true})
    }
    catch(err){
        res.status(500).json({error: err.message})
    }
})
app.post("/api/campers/get", async (req, res)=>{
    if(!req.body.lastName){
        res.json([]);
        return;
    }
    try{
        const campers = await masterDB("campers").whereRaw('LOWER(last_name) LIKE ?', [`${req.body.lastName.toLowerCase()}%`])
        res.json(campers);
    }
    catch(err){
        res.status(500).json({error: err.message})
    }
}) 
app.post("/api/campers/delete", async(req, res) =>{
    try{
        await masterDB("campers")
        .where("id", req.body.id)
        .limit(1)
        .del();
        res.json({success: true})
    }
    catch(err){
        res.json({error: err.message})
    }
})

app.post("/api/camper/id", async (req, res)=>{
    try{
        const campers = await masterDB("campers").select("*").where("id", req.body.id);
        res.json(campers);
    }
    catch(err){
        res.status(500).json({error: err.message})
    }
})

app.post('/api/campers/update', async (req, res) => {
    try {
         await masterDB('campers')
        .where("id", req.body.id)
        .update(req.body)

        res.json({success: "true"});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.get("/api/campers", async (req, res) => {
    try {
        const campers = await masterDB('campers').select('*');
        res.json(campers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/spaces/rate", async (req, res) => {
    try{
       const space = await masterDB("spaces").select("*").where("name", req.body.space);
       res.json({"daily": space[0].daily, "weekly": space[0].weekly, "monthly": space[0].monthly})

    }
    catch(err){
        res.status(500).json({"error": err})
    }
})


function toLocalDateOnly(str) {
     const [y, m, d] = str.split("-").map(Number);
     return new Date(y, m - 1, d);
 }
app.get("/api/download-excel", async (req, res) => {
  // Example dictionary
  const dict = await masterDB("reservations").select("*");
    console.log(dict)

  // Create workbook + worksheet
  const worksheet = XLSX.utils.json_to_sheet(dict);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Dictionary");

  // Write to buffer (instead of file)
  const buffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx"
  });

  // Send file as download
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=dictionary.xlsx"
  );
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.send(buffer);
});