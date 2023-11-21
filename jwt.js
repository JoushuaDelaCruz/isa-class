const jwt = require("jsonwebtoken");
require("dotenv").config();

const expireTime = "60s";

const login = async (payload) => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      process.env.JWT_SECRET_KEY,
      { expiresIn: expireTime },
      (err, token) => {
        if (err) {
          reject(err);
        }
        resolve(token);
      }
    );
  });
};

const _verify = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        throw err;
      }
      resolve(decoded);
    });
  });
};

const verify = async (token) => {
  try {
    const data = await _verify(token);
    return { is_valid: true, status: "valid", user: data };
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return { is_valid: false, status: "expired" };
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return { is_valid: false, status: "tampered" };
    }
    return { is_valid: false, status: "invalid" };
  }
};

module.exports = { login, verify };
