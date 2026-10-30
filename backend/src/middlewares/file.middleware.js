const multer = require("multer")


const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 8 * 1024 * 1024 // 8MB limit for screenshots and PDFs
    }
})


module.exports = upload