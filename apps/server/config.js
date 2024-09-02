
module.exports = {
    ENV : process.env.NODE_ENV 
    || "development",
    PORT: process.env.PORT 
    || 9119,
    DB_URI: process.env.DATABASE_URL 
    || "mongodb://localhost/smartic?replicaSet=rs"
}