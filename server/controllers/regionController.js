const User = require('../schemas/userSchema');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const axios = require('axios');

async function getClimateData(lat, lon) {
    try {
      const response = await axios.get('http://climateapi.scottpinkelman.com/api/v1/location/' + lat + '/' + lon, {
        params: {
        },
        headers: {
          Accept: 'application/json',
        },
      });
  
      console.log('Climate data:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching climate data:', error.response?.data || error.message);
    }
  }

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
  
      const soil_response = await axios.get('https://api.openepi.io/soil/type', {
        params: {
          lon: region.lon,
          lat: region.lat,
        },
        headers: { Accept: 'application/json' },
      });
  
      const soil_type = soil_response.data?.properties?.most_probable_soil_type || 'Unknown';
  
      const climate_response = await axios.get(`http://climateapi.scottpinkelman.com/api/v1/location/${region.lat}/${region.lon}`, {
        headers: { Accept: 'application/json' },
      });
  
      const climateData = climate_response.data || {};

      const koppen_geiger_zone = climateData.return_values[0].koppen_geiger_zone || 'Unknown';
      const zone_description = climateData.return_values[0].zone_description || 'Unknown';
  
      user.region = {
        ...region,
        soil_type,
        climate: {
          koppen_geiger_zone,
          zone_description,
        },
        plants: user.region?.plants || [],
      };
  
      await user.save();
  
      res.status(200).json({
        status: 'success',
        message: 'Region added successfully',
        user,
      });
    } catch (error) {
      console.error('addRegion error:', error.response?.data || error.message);
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
    if (!user.region.lon || Object.keys(user.region).length === 0) {
        return next(new AppError('Region not found', 404));
    }
      

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
