const express = require('express');
require("dotenv").config({ path: __dirname + "/config.env" });
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const passport = require("passport");
require("./utils/passportConfig");

const { verifyJWT } = require("./utils/jwtUtils");
const authRouter = require("./routes/authRouter");
const regionRouter = require("./routes/regionRouter");
const plantRouter = require("./routes/plantRouter");
const weatherRouter = require("./routes/weatherRoter");
const eventRouter = require("./routes/eventRouter");

const globalErrorHandler = require('./controllers/errorController');

const app = express();
const path = require('path')


app.use(cors({
  origin: 'https://demeter-9xs8.onrender.com', 
  credentials: true,               
}));app.use(cookieParser());
app.use(express.json());


if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

app.use(passport.initialize());

// Routes

app.use(express.static(path.join(__dirname, './client/dist')));

app.use("/auth", authRouter);
app.use("/region", regionRouter);
app.use("/plants", plantRouter);
app.use("/weather", weatherRouter);
app.use("/events", eventRouter);


app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, './client/dist/index.html'));
});
app.use(globalErrorHandler);


module.exports = app;
