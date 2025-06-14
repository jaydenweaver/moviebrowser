exports.tokenError = (res, err) => {
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: true,
            message: 'JWT token has expired',
        });
    }

    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: true,
            message: 'Invalid JWT token',
        });
    }

    return res.status(401).json({
        error: true,
        message: 'Authentication failed',
    });
};

exports.malformedAuth = (res) => { // change this to missingAuth, create new malformedAuth
    return res.status(401).json({ 
        error: true,
        message: "Authorization header is malformed",
    });
};

exports.missingAuth = (res) => {
    return res.status(401).json({ 
        error: true,
        message: "Authorization header ('Bearer token') not found",
    });
};

exports.invalidLogin = (res) => {
    return res.status(401).json({
        error: true,
        message: 'Invalid email or password',
    });
};

exports.forbidden = (res) => {
    return res.status(403).json({
        error: true,
        message: 'Forbidden',
    });
}

exports.userExists = (res) => {
    return res.status(409).json({
        error: true,
        message: 'User already exists',
    });
};

exports.validationError = (res, message = 'Invalid input') => {
    return res.status(400).json({
        error: true,
        message,
    });
};

exports.notFoundError = (res, message = 'Resource not found') => {
    return res.status(404).json({
        error: true,
        message,
    });
};

exports.serverError = (res) => {
    return res.status(500).json({
        error: true,
        message: 'An internal server error occurred',
    });
};

exports.incompleteRequest = (res) => {
    return res.status(400).json({
        error: true,
        message: 'Request body incomplete: firstName, lastName, dob and address are required.',
    });
};

exports.invalidRequestBody = (res) => {
    return res.status(400).json({
        error: true,
        message: 'Request body invalid: firstName, lastName and address must be strings only.',
    });
};

exports.invalidDate = (res, message = 'Invalid input: dob must be a real date in format YYYY-MM-DD.') => {
    return res.status(400).json({
        error: true,
        message ,
    });
};