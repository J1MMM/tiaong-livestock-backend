const jwt = require('jsonwebtoken')

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);
    const token = authHeader.split(' ')[1]
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decode) => {
            if (err) return res.sendStatus(403); //invalid token
            req.email = decode.UserInfo.email;
            req.roles = decode.UserInfo.roles;
            req.id = decode.UserInfo.id;
            req.fullname = decode.UserInfo.fullname;
            next()
        }
    )
}

module.exports = verifyJWT