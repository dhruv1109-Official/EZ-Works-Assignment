const jwt=require("jsonwebtoken")



exports.auth=(roles) => (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      if (roles && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      next();
    } catch (err) {
      res.status(400).json({ message: "Invalid token" });
    }
  };

