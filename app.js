const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const path = require('path');
const rfs = require('rotating-file-stream');
const app = express();
const port = 3000;
const logDirectory = path.join(__dirname, 'log');
 
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)
// setup the logger
var accessLogStream = rfs.createStream('access.log', {
  interval: '1d', // rotate daily
  path: logDirectory
})
app.disable('etag');
app.use(morgan('combined', { stream: accessLogStream }))
app.get('/', (req, res, next) => {
    res.send(`<h1>Aloha World!</h1>`);
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})