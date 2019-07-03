import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: "./public/uploads",
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)) //Appending extension
    }
});

const upload = multer({ storage: storage });

export default upload;
