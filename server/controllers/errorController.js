const AppError = require('../utils/appError')

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}.`
    return new AppError(message, 400);
}

const handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value ${value}. Please use another value!`
    return new AppError(message, 400);
}

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map(el => el.message)
    const message = `Invalid Input data. ${errors.join('. ')}`
    return new AppError(message, 400)
}

const handleJWTError = (err) => {
    return new AppError("Invalid token. Please log in again", 401);
}

const handleJWTExpiredError = (err) => {
    return new AppError("Your token has expired. Please log in again", 401);
}

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    })
}

const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to the client
    if(err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        })
    // Programming or other unknown error: don't leak error details
    }else {
        // 1) Log Error

        console.error('ERROR 🧨', err);

        // 2) Send generic message
        
        res.status(500).json({
            status: "Error",
            message: "Something went wrong!"
        })
    }

}

module.exports = (err,req, res, next) => { 
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'Error';

    if (process.env.NODE_ENV === 'development') {
        let error = { ...err };
        if(err.name === "CastError") {
            error = handleCastErrorDB(error);
        }
        if(err.code === 11000) {
            error = handleDuplicateFieldsDB(err);
        }
        if(err.name === "ValidationError") {
            error = handleValidationErrorDB(err);
        }
        if(err.name === 'JsonWebTokenError') {
            error = handleJWTError(err);
        }
        if(err.name === 'TokenExpiredError') {
            error = handleJWTExpiredError(err);
        }
        sendErrorDev(err, res);
    } else if(process.env.NODE_ENV === 'production') {
        let error = { ...err };
        if(err.name === "CastError") {
            error = handleCastErrorDB(error);
        }
        if(err.code === 11000) {
            error = handleDuplicateFieldsDB(err);
        }
        if(err.name === "ValidationError") {
            error = handleValidationErrorDB(err);
        }
        if(err.name === 'JsonWebTokenError') {
            error = handleJWTError(err);
        }
        if(err.name === 'TokenExpiredError') {
            error = handleJWTExpiredError(err);
        }
        sendErrorProd(error, res);
    }
}