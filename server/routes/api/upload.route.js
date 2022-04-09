const router = require("express").Router();
const fs = require("fs");
const { promisify } = require('util');
const busboy = require("busboy");

const getFileDetails = promisify(fs.stat);

const uniqueAlphaNumericId = (() => {
    const heyStack = '0123456789abcdefghijklmnopqrstuvwxyz';
    const randomInt = () => Math.floor(Math.random() * Math.floor(heyStack.length));

    return (length = 24) => Array.from({ length }, () => heyStack[randomInt()]).join('');
})();

const getFilePath = (fileId, fileName) => {
    const ext = fileName.split('.').pop();
    return `./uploads/${fileId}.${ext}`;
};

// @route       GET /request
// @desc        New upload request
// @access      Public
router.get("/request", async (req, res) => {
    if (!req.query.fileName) {
        return res.status(400).json({ message: "Invalid request" })
    }

    try {
        const fileId = uniqueAlphaNumericId();
        const filePath = getFilePath(fileId, req.query.fileName)

        fs.createWriteStream(filePath, { flags: 'w' });

        return res.json({ message: "Upload request successful", data: { fileId } });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Oops! Something went wrong"});
    }
})

// @route       POST /
// @desc        New upload
// @access      Public
router.post("/", async (req, res) => {
    try {
        const contentRange = req.headers['content-range'];
        const fileId = req.headers['x-file-id'];

        if (!contentRange) {
            console.log('Missing Content-Range');
            return res.status(400).json({ message: 'Missing "Content-Range" header'});
        }

        if (!fileId) {
            console.log('Missing File Id');
            return res.status(400).json({ message: 'Missing "X-File-Id" header'});
        }

        const match = contentRange.match(/bytes=(\d+)-(\d+)\/(\d+)/);

        if (!match) {
            console.log('Invalid Content-Range Format');
            return res.status(400).json({ message: 'Invalid "Content-Range" Format'});
        }

        const rangeStart = Number(match[1]);
        const rangeEnd = Number(match[2]);
        const fileSize = Number(match[3]);

        if (rangeStart >= fileSize || rangeStart >= rangeEnd || rangeEnd > fileSize) {
            return res.status(400).json({ message: 'Invalid "Content-Range" provided'});
        }

        let filePath;

        const bb = busboy({ headers: req.headers })

        bb.on("file", async (_, file, fileDetails) => {
            if (!fileId) {
                req.pause();
            }

            filePath = getFilePath(fileId, fileDetails.filename)
            getFileDetails(filePath)
                .then((stats) => {

                    if (stats.size !== rangeStart) {
                        return res.status(400).json({ message: 'Bad "chunk" provided'});
                    }

                    file
                        .pipe(fs.createWriteStream(filePath, { flags: 'a' }))
                        .on('error', (err) => {
                            console.error('failed upload');
                            throw err;
                        });
                })
                .catch(err => {
                    console.log('No File Match', err);
                    return res.status(400).json({ message: 'No file found'});
                })
        })


        bb.on('error', (err) => {
            console.log("Busboy Error")
            throw err
        })

        bb.on("finish", () => {
            return res.json({
                message: "Upload Successful",
                data: {
                    filePath: filePath.substring(1, filePath.length)
                }
            })
        })

        req.pipe(bb);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Oops! Something went wrong'})
    }
})

module.exports = router;
