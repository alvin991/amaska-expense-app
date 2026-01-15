const jwt = require('jsonwebtoken');

const { JWT_SECRET } = require('./secrets');

function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    jwt.verify(token, JWT_SECRET, (err, payload) => {
        if (err) {
            console.error('JWT verify error:', err.message);
            return res.status(401).json({ error: 'Invalid token' });
        }
        req.user = payload; // { userId, username }
        next();
    });
}

module.exports = { authenticateJWT };
