const jwt = require("jsonwebtoken");
const config = require('../config');


validateToken = (req, res, next) => {
    let token = req.headers["Authorization"] || req.headers["authorization"];
  
    if (!token) {
      return res.status(403).send({ message: "Token missing in the request" });
    }
  
    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: "Unauthorized!" });
      }
      req.email = decoded.id;
      next();
    });
  };

  const authJwt = {
    validateToken
  };
  module.exports = authJwt;