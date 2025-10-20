const User = require('../schemas/userSchema');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');

const addRegion = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return next(new AppError('No token provided', 401));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) return next(new AppError('Invalid token', 401));

    const { region } = req.body;
    if (!region) return next(new AppError('Region is required', 400));

    const user = await User.findOne({ id: decoded.id });
    if (!user) return next(new AppError('User not found', 404));

    user.region = region;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Region added successfully',
      user,
    });
  } catch (error) {
    console.error('addRegion error:', error);
    return next(new AppError(error.message || 'Server error', 500));
  }
};

const getRegion = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return next(new AppError('No token provided', 401));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) return next(new AppError('Invalid token', 401));

    const user = await User.findOne({ id: decoded.id });
    if (!user) return next(new AppError('User not found', 404));
    if (!user.region) return next(new AppError('Region not found', 404));

    res.status(200).json({
      status: 'success',
      region: user.region,
    });
  } catch (error) {
    console.error('getRegion error:', error);
    return next(new AppError(error.message || 'Server error', 500));
  }
};

module.exports = { getRegion, addRegion };
