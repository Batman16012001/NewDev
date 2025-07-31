const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser'); 
const cors = require('cors');

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());

app.get('/read-file', (req, res) => {
  const filePath = req.query.path;

  if (!filePath) {
    return res.status(400).json({ error: 'File path is required' });
  }

  const fullPath = path.join(__dirname, filePath);

  fs.readFile(fullPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading file', details: err.message });
    }

    res.json({ content: data });
  });
});


app.post('/write-file', (req, res) => {
  const { path: filePath, content } = req.body;
  if (!filePath || content === undefined) {
    return res.status(400).json({ error: 'File path and content are required' });
  }
  const fullPath = path.join(__dirname, filePath);
  fs.writeFile(fullPath, content, 'utf8', (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error writing file', details: err.message });
    }
    res.json({ message: 'File written successfully' });
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
