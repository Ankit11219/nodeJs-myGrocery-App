const jwt = require('jsonwebtoken');
const userModel = require('../models/schema/auth');
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decode = jwt.verify(token, 'Dragon');
        const user = await userModel.findOne({ _id: decode._id, 'tokens.token': token });

        if (!user)
            throw new Error;

        req.token = token;
        req.user = user;

        next();
    } catch (e) {
        return res.status(401).send({ message: 'Invalid Credentials' });
    }
}

module.exports = auth;