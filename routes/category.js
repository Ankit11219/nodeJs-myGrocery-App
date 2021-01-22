const multer = require('multer');
const express = require('express');
var router = express.Router();
const auth = require('../middleware/auth');
const CategoryModel = require('../models/schema/addCategory');


const MIME_TYPE_MAP = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg"
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const isValid = MIME_TYPE_MAP[file.mimetype];
        let error = new Error("Invalid mime type");
        if (isValid) {
            error = null;
        }
        cb(error, "uploads");
    },
    filename: (req, file, cb) => {
        const name = file.originalname
            .toLowerCase()
            .split(" ")
            .join("-");
        const ext = MIME_TYPE_MAP[file.mimetype];
        cb(null, name.split(".")[0] + "-" + Date.now() + "." + ext);
    }
});

var upload = multer({
    storage: storage,
    limits: {
        fileSize: 2000000
    }
});

router.post('/', upload.single('imageLink'), async (req, res) => {
    console.log(req.body);
    const url = req.protocol + "://" + req.get("host");
    try {
        req.body.imageLink = url + "/images/" + req.file.filename;
        console.log(req.body);
        // if (req.user.role != 'Admin' || req.user.role != 'Super Admin')
        //     throw 'You are not Authorize';
        // const category = new CategoryModel(req.body);
        // await category.save();
        res.status(201).send(req.body);
    } catch (e) {
        console.log("error category", e);
        res.status(400).send();
    }
});

module.exports = router;


