const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config");

function signToken(payload) {
  return jwt.sign(
    {
      id: payload.id,
      role: payload.role,
      jti: payload.jti || crypto.randomUUID(),
    },
    JWT_SECRET,
    { algorithm: "HS256", expiresIn: JWT_EXPIRES_IN }
  );
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
}

module.exports = {
  signToken,
  verifyToken,
};
