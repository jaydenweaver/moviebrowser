const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const errors = require('../utils/errors');

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

/*

user table: 
- id <- PRIMARY KEY, AUTO-INCREMENT
- email <- UNIQUE, NOT NULL
- password <- NOT NULL
- firstname
- lastName
- dob
- address

*/

exports.register = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) 
        return errors.validationError(res, 'Request body incomplete, both email and password are required');

    const emailTest = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!emailTest)
        return errors.validationError(res, 'Invalid email');

    const emailNormal = email.trim().toLowerCase();

    try {
        const exists = await db('users').where({ email: emailNormal }).first();
        if (exists)
            return errors.userExists(res);

        const passwordHash = await bcrypt.hash(password, 10);

        await db('users').insert({
            email: emailNormal,
            password: passwordHash,
        });

        return res.status(201).json({ message: 'User created.' });
    } catch (err) {
        return errors.serverError(res);
    }
};

exports.login = async (req, res) => {
    const { email,
            password,
            longExpiry,
            bearerExpiresInSeconds,
            refreshExpiresInSeconds
            } = req.body;

    if (!email || !password) 
        return errors.validationError(res, 'Request body incomplete, both email and password are required');
    

    const emailNormal = email.trim().toLowerCase();

    try {
        const user = await db('users')
                    .where({ email: emailNormal })
                    .first();

        if (!user)
            return errors.invalidLogin(res);

        const passwordValid = await bcrypt.compare(password, user.password);

        if (!passwordValid)
            return errors.invalidLogin(res);
        
        const bearerToken = jwt.sign(
            { userId: user.id },
            JWT_SECRET,
            { expiresIn: bearerExpiresInSeconds || 600 }
            );

        const refreshToken = jwt.sign(
            { userId: user.id },
            REFRESH_SECRET,
            { expiresIn: refreshExpiresInSeconds || 86400 }
            );
    
        return res.json({
                    bearerToken: {
                        token: bearerToken,
                        token_type: 'Bearer',
                        expires_in: bearerExpiresInSeconds || 600,
                    },
                    refreshToken: {
                        token: refreshToken,
                        token_type: 'Refresh',
                        expires_in: refreshExpiresInSeconds || 86400,
                    },
                });
    } catch (err) {
        return errors.serverError(res);
    }
};

exports.refresh = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken)
        return errors.validationError(res, 'Request body incomplete, refresh token required');
    
    try {
        const newToken = jwt.verify(refreshToken, REFRESH_SECRET);

        const newBearer = jwt.sign(
            { userId: newToken.userId },
            JWT_SECRET,
            { expiresIn: 600},
        );

        const newRefresh = jwt.sign(
            { userId: newToken.userId },
            REFRESH_SECRET,
            { expiresIn: 86400},
        );

        return res.json({
                    bearerToken: {
                        token: newBearer,
                        token_type: 'Bearer',
                        expires_in: 600,
                        },
                    refreshToken: {
                        token: newRefresh,
                        token_type: 'Refresh',
                        expires_in: 86400,
                    },
                });

    } catch (err) {
        return errors.tokenError(res, err);
    }
};

exports.logout = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken)
        return errors.validationError(res, 'Request body incomplete, refresh token required');
    
    try {
        jwt.verify(refreshToken, REFRESH_SECRET);

        return res.json({
                error: false,
                message: 'Token successfully invalidated'
            });

    } catch (err) {
        return errors.tokenError(res, err);
    }

};

exports.getProfile = async (req, res) => {
    if (Object.keys(req.query).length > 0) {
        const params = Object.keys(req.query).join(', ');
        return errors.validationError(res, `Invalid query parameters: ${params}. Query parameters are not permitted.`);
    }

    const email = req.params.email;
    if (!email) {
        return errors.validationError(res, 'Missing required email query parameter');
    }

    const auth = req.headers['authorization'];
    const token = auth?.startsWith('Bearer ') ? auth.split(' ')[1] : null;

    if (token)
        return handleProfileAuth(res, email, token);
    else 
        return handleProfile(res, email);
};

async function handleProfile(res, email) {
    try {
        const user = await db('users')
            .where('email', email)
            .select('email', 'firstName', 'lastName')
            .first();

        if (!user) return errors.notFoundError(res, 'User not found');

        return res.json(user);
    } catch (err) {
        return errors.serverError(res, err);
    }
}

async function handleProfileAuth(res, email, token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        const user = await db('users')
            .where('email', email)
            .select('id', 'email', 'firstName', 'lastName', 'dob', 'address')
            .first();

        if (!user) 
            return errors.notFoundError(res, 'User not found');

        if (decoded.userId === user.id)
            return res.json(user);
        else 
            return res.json({ 
                email: user.email, 
                firstName: user.firstName, 
                lastName: user.lastName 
            });
    } catch (err) {
        return errors.tokenError(res, err);
    }
}

function isValidDate(dob) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return false;

    const [year, month, day] = dob.split('-').map(Number);
    const date = new Date(dob);

    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
}

exports.updateProfile = async (req, res) => {
    const auth = req.headers['authorization'];

    if (!auth)
        return errors.missingAuth(res);

    if (!auth.startsWith('Bearer '))
        return errors.malformedAuth(res);
    
    const token = auth.split(' ')[1];
    
    const email = req.params.email;
    const data = req.body;

    if (!data.firstName || !data.lastName || !data.address || !data.dob)
        return errors.incompleteRequest(res);

    if (typeof data.firstName !== 'string' || typeof data.lastName !== 'string' || typeof data.address !== 'string')
        return errors.invalidRequestBody(res);

    if (!isValidDate(data.dob)) 
        return errors.invalidDate(res);

    const date = new Date(data.dob);
    if (date > new Date()) 
        return errors.invalidDate(res, 'Invalid input: dob must be a date in the past.');

    const dateFilter = date.toISOString().split('T')[0];
    data.dob = dateFilter;

    if (Object.keys(req.query).length > 0) {
        const params = Object.keys(req.query).join(', ');
        return errors.validationError(res, `Invalid query parameters: ${params}. Query parameters are not permitted.`);
    }
        
    if (!email)
        return errors.validationError(res, 'Missing required email query parameter');

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        const owner = await db('users')
        .where('email', email)
        .select('id')
        .first();

        if (!owner)
            return errors.notFoundError(res, 'User not found');

        if (decoded.userId === owner.id) {
            await db('users')
                .where('email', email)
                .update(data);

            const user = await db('users')
                .where('email', email)
                .select(
                    'email', 
                    'firstName', 
                    'lastName', 
                    'dob', 
                    'address'
                )
                .first();

            if (user.dob instanceof Date) 
            user.dob = user.dob.toISOString().split('T')[0];

            return res.json(user);
        } else 
            return errors.forbidden(res);
    } catch (err) {
        return errors.tokenError(res, err);
    }
};