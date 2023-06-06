const checkPermission = (permission) => async (req, res, next) => {

  const userPermissions = await req.user.role.permissions;
  if (userPermissions.includes(permission)) {
    next();
  } else {
    res.status(401).json({ message: "Access Denied" });
  }
};

module.exports = {checkPermission}
