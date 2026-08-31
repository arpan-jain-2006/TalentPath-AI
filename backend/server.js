require("dotenv").config();
const server = require("./src/app.js");
const connectToDB = require("./src/config/database.js");

connectToDB();
server.listen(3000,()=>{
    console.log("App is running at port 3000");
})
