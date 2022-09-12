const jwt = require("jsonwebtoken");

const config = process.env;

const verifyToken = async (req, res, next) => {
    let token = null;
    const bearerHeader = req.headers["authorization"];
    if(typeof bearerHeader !== 'undefined'){
        const bearer = bearerHeader.split(' ');
        token = bearer[1];
    }

    if (!token) {
        return res.status(403).send({status:403, message:"A token is required for authentication"});
    }
    try {
        const decoded = await jwt.verify(token, config.TOKEN_KEY);
        req.user = decoded;
    } catch (err) {
        return res.status(401).send({status:403, message:"Invalid Token"});
    }
    return next();
};

module.exports = verifyToken;