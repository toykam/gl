const express = require('express')
const fs = require('fs');
const path = require('path')

const router = express.Router()

router.post('/upload/:room', (req, res) => {
    // Do file upload here
    try {
        var dir = __dirname + `/../public/audio/${req.params.room}-group/`;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, 0744);
        }
        if (!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            // console.log(req.files);
            let audio = req.files.audio;
            // console.log(audio)

            //Use the mv() method to place the file in upload directory (i.e. "uploads")
            audio.mv(dir + audio.name);

            //send response
            res.send({
                status: true,
                message: 'File is uploaded',
                data: {
                    name: audio.name,
                    mimetype: audio.mimetype,
                    size: audio.size
                }
            });
        }
    } catch (err) {
        res.status(500).send(err);
    }

});

module.exports = router;