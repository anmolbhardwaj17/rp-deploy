const mongoose = require('mongoose');

const DB = process.env.DATABASE;

mongoose.connect(DB).then(async ()=>{
    console.log("connected to database successfully")
}).catch((err)=>{
    
    console.error('connection failed');
});
