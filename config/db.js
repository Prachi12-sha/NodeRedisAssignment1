require("dotenv").config()
const Redis = require("ioredis")

const redis = new Redis({
    host: process.env.HOST,
    port: process.env.REDIS_PORT
})

redis.on("error", (error) => {
    console.error("Redis connection error:", error);
});

module.exports =redis
