const jwt = require("jsonwebtoken");
const user = require("../models/user");
const redisclient = require("../config/redis");


const usermiddleware = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            throw new Error("Token does not exist.");
        }

        const payload = jwt.verify(token,"helllowhatisup");
        const { _id } = payload;
         console.log("JWT payload:", payload);

        if (!_id) {
            throw new Error("Invalid token payload.");
        }

        const result = await user.findById(_id);
        if (!result) {
            throw new Error("User does not exist.");
        }

        // Redis `exists` returns 1 or 0, not a boolean
        const isBlocked = await redisclient.exists(`token:${token}`);
        if (isBlocked) {
            throw new Error("Invalid token (blacklisted).");
        }

        req.result = result;
        next();
    } catch (err) {
        res.status(401).send("Error: " + err.message);
    }
};

module.exports = usermiddleware;
