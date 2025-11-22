module.exports = {
    jwtSecret: process.env.JWT_SECRET || 'mySuperSecureSecretKey123',
    mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/tune-together'
};