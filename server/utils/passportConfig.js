const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../Schemas/userSchema");

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  async(_accessToken, _refreshToken, profile, done) => {
    try{
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = await User.create({
          googleId: profile.id,
          username: profile.displayName,
          email: profile.emails?.[0]?.value?.toLowerCase(),
        });
      }
      return done(null, user);
    } catch(err){
      return done(err);
    }
  }
));

module.exports = passport;
