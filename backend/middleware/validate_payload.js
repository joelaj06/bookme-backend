const validateEmptyPayload = (req, res, next) => {
    if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
      if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Empty payload is not allowed" });
      }else{
        next();
      }
    }else{
        next();
    }
}

module.exports = validateEmptyPayload