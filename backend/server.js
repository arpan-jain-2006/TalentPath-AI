require("dotenv").config();
const server = require("./src/app.js");
const connectToDB = require("./src/config/database.js");

const PORT =  3000;

connectToDB();

server.listen(PORT, () => {
    console.log(`App is running at port ${PORT}`);
});