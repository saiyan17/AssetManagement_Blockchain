var passport = require('passport');
var User = require('./models/User');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth20');
var config = require('./config.js');
var KeyGenerator = require('./generatekeys')
//exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser((user, cb) => {
    cb(null, user);
});
passport.deserializeUser((obj, cb) => {
    cb(null, obj);
});

exports.getToken = function (user) {
    return jwt.sign(user, config.secretKey,
        { expiresIn: 86400 });
};

var opts = {};
var cookieExtractor = function (req) {
    var token = null;
    if (req && req.cookies) token = req.cookies['jwt'];
    return token;
};
opts.jwtFromRequest = cookieExtractor; //r'ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => {
        User.findOne({ _id: jwt_payload._id }, (err, user) => {
            if (err) {
                return done(err, false);
            }
            else if (user) {
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        });
    }
));

exports.verifyUser = passport.authenticate('jwt', { session: false });


exports.verifyAdmin = function (req, res, next) {
    User.findOne({ _id: req.user._id })
        .then((user) => {
            console.log("User: ", req.user);
            if (user.admin) {
                next();
            }
            else {
                err = new Error('You are not authorized to perform this operation!');
                err.status = 403;
                return next(err);
            }
        }, (err) => next(err))
        .catch((err) => next(err))
}

exports.facebookPassport = passport.use(new FacebookStrategy({
    clientID: config.facebook.clientId,
    clientSecret: config.facebook.clientSecret,
    callbackURL: config.baseUrl + config.facebook.callbackURL,
    profileFields: ["email", "name"]
}, (accessToken, refreshToken, profile, done) => {

    User.findOne({ email: profile.emails[0].value }, (err, user) => {
        if (err) {
            return done(err, false);
        }
        if (!err && user !== null) {
            user.facebookId = profile.id;
            user.save((err, user) => {
                if (err)
                    return done(err, false);
                else
                    return done(null, user);
            });
            // return done(null, user);
        }
        else {
            user = new User({});
            user.facebookId = profile.id;
            user.firstname = profile.name.givenName;
            user.lastname = profile.name.familyName;
            user.email = profile.emails[0].value;
            const { publicKey, privateKey } = KeyGenerator();
            user.publicKey = publicKey.toString();
            user.privateKey = privateKey.toString();
            user.save((err, user) => {
                if (err)
                    return done(err, false);
                else
                    return done(null, user);
            })
        }
    });
}
));

exports.googlePassport = passport.use(new GoogleStrategy({
    clientID: config.google.clientId,
    clientSecret: config.google.clientSecret,
    callbackURL: config.baseUrl + config.google.callbackURL,
    profileFields: ["email", "name"]
}, (accessToken, refreshToken, profile, done) => {
    console.log(JSON.stringify(profile));
    User.findOne({ email: profile.emails[0].value }, (err, user) => {
        if (err) {
            return done(err, false);
        }
        if (!err && user !== null) {
            user.googleId = profile.id;
            user.save((err, user) => {
                if (err)
                    return done(err, false);
                else
                    return done(null, user);
            });
            // return done(null, user);
        }
        else {
            user = new User({});
            user.firstname = profile.name.givenName
            user.googleId = profile.id;
            user.lastname = profile.name.familyName;
            const { publicKey, privateKey } = KeyGenerator();
            user.publicKey = publicKey.toString();
            user.privateKey = privateKey.toString();
            user.email = profile.emails[0].value;
            console.log(user);
            user.save((err, user) => {
                if (err)
                    return done(err, false);
                else
                    return done(null, user);
            })
        }
    });
}
));

