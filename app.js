
const express = require("express");
const bodyParser = require("body-parser");
const packageRoute = require("./routes/packageRoutes");

var cors = require('cors')
process.stdout.write("APP::::::::::")
const app = express();

app.use(cors());
app.options("*", cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.use((req, res, next) => {
  // console.log(`${req.method} ${req.url}`);
  next();
});


// app.use("/output-processing-service", packageRoute);
app.use("/outputProcessingService", packageRoute);



module.exports = app;



