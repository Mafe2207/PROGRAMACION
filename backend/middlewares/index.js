// middleware collection exports

// dummy token verification - real implementation should decode JWT
exports.verifyToken = (req, res, next) => {
    // placeholder: assume authenticated
    next();
};

// role check factory
exports.checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        // placeholder: allow all roles
        next();
    };
};

// validation helpers used during signup/signup
exports.verifysingUp = {
    checkDuplicateUsernameOrEmail: (req, res, next) => {
        // TODO: check db for duplicate username/email
        next();
    },
    checkRoleExisted: (req, res, next) => {
        // TODO: validate that provided role is one of known roles
        next();
    }
};
