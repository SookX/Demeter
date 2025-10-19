const dotenv = require('dotenv').config({
    path: './config.env'
});
const mongoose = require('mongoose');
const multer = require('multer');
const app = require('./app');

// const uri = process.env.URL.replace('<db_password>', process.env.PASSWORD);

// mongoose.connect(uri, {useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false}).then(
//     console.log('Successfully connected to the database!')
// )


const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`The server is running on port: ${port}`);
})