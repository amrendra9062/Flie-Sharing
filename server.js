const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware to handle file uploads
app.use(fileUpload());

// Serve static files (like index.html)
app.use(express.static(path.join(__dirname)));

// Upload route
app.post('/upload', (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    let files = req.files.files;

    // Ensure we handle both single and multiple files
    if (!Array.isArray(files)) {
        files = [files];
    }

    const uploadPromises = files.map(file => {
        const uploadPath = path.join(__dirname, 'uploads', file.name);

        return new Promise((resolve, reject) => {
            file.mv(uploadPath, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    });

    Promise.all(uploadPromises)
        .then(() => res.send('Files uploaded successfully'))
        .catch(err => res.status(500).send(err));
});

// Download route
app.get('/download/:fileName', (req, res) => {
    const filePath = path.join(__dirname, 'uploads', req.params.fileName);

    res.download(filePath, (err) => {
        if (err) {
            if (!res.headersSent) {
                return res.status(404).send('File not found');
            }
        }
    });
});

// Route to list files in the uploads directory
app.get('/files', (req, res) => {
    const uploadDir = path.join(__dirname, 'uploads');

    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            return res.status(500).send('Unable to scan directory');
        }
        res.json(files); // Send file names as a JSON response
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
