const { verifyJWT } = require("../utils/jwtUtils");


function logger(req, res, next) {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
}


function getToken(req) {
  const bearer = req.headers.authorization;
  if (bearer?.startsWith("Bearer ")) return bearer.split(" ")[1];
  return req.cookies?.jwt || null;
}

function protect(req, res, next) {
  const token = getToken(req);

  if(!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  const decoded = verifyJWT(token);
  if (!decoded) {
    return res.status(403).json({ error: "Invalid token" });
  }

  req.user = decoded;
  next();
}

module.exports = { protect, logger };
