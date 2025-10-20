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

const globalErrorHandler = require('./controllers/errorController');

const app = express();
const path = require('path')

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true,               
}));app.use(cookieParser());
app.use(express.json());


if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

app.use(passport.initialize());

// Routes
app.use("/auth", authRouter);
app.use("/region", regionRouter);
app.use("/plants", plantRouter);

//  home
app.get("/", (req, res) => {
  const token = req.cookies?.jwt;
  let decoded = null;
  try {
    if (token) decoded = verifyJWT(token);
  } catch {}
  res.status(200).send("Home");
});

app.use(globalErrorHandler);

app.use(express.static(path.join(__dirname, '/client/dist')))


module.exports = app;
