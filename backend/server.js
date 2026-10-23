require("dotenv").config();
const server = require("./src/app.js");
const connectToDB = require("./src/config/database.js");

const PORT = process.env.PORT || 3000;

connectToDB();

server.listen(PORT, () => {
    console.log(`🚀 TalentPath AI Server is running at port ${PORT}`);
});