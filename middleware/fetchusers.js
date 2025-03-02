require('dotenv').config();

const jwt = require('jsonwebtoken');
const jwt_secret = process.env.JWT_SECRET; 

const fetchuser = (req, res, next) => {
    // Get the user from the JWT token and add ID to the req object
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).send({ error: "Please authenticate using a valid token" });
    }

    try {
        const data = jwt.verify(token, jwt_secret);
        req.user = data.user;
        next();
    } catch (error) {
        return res.status(401).send({ error: "Please authenticate using a valid token" });
    }
};

module.exports = fetchuser;
