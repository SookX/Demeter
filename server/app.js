const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');

const globalErrorHandler = require('./controllers/errorController');

const app = express();
const path = require('path')

app.use(express.json());
app.use(cors())
app.use(express.static(path.join(__dirname, '/client/dist')))

if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}


app.use(globalErrorHandler);

module.exports = app;