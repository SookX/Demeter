const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../schemas/userSchema");

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  async(_accessToken, _refreshToken, profile, done) => {
    try{
    const userData = {
      googleId: profile.id,
      username: profile.displayName,
      email: profile.emails?.[0]?.value?.toLowerCase(),
    };

    let user = await User.findOneAndUpdate(
      { googleId: profile.id },
      { $setOnInsert: userData },
      { new: true, upsert: true }
    );
    return done(null, user);

    } catch(err){
      return done(err);
    }
  }
));

module.exports = passport;
