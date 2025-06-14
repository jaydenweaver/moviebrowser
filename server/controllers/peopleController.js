const db = require('../db');
const jwt = require('jsonwebtoken');
const errors = require('../utils/errors');
const parser = require('../utils/parser');

const JWT_SECRET = process.env.JWT_SECRET;

exports.getPerson = async (req, res) => {
    const auth = req.headers['authorization'];
    
    if (!auth)
        return errors.missingAuth(res);
    
    // people > with invalid auth > with malformed bearer token > should contain specific message for 'Authorization header ('Bearer token') not found'
    // seems like it should be a malformedAuth error? but test seems to want missingAuth error.
    if (!auth.startsWith('Bearer '))
        return errors.missingAuth(res);

    const token = auth.split(' ')[1];

    try {
        jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return errors.tokenError(res, err);
    }

    const id = req.params.id;

    if (Object.keys(req.query).length > 0) {
        const params = Object.keys(req.query).join(', ');
        return errors.validationError(res, `Invalid query parameters: ${params}. Query parameters are not permitted.`);
    }

    if (!id)
        return errors.validationError(res, 'Missing required id query parameter');

    try {
        const person = await db('names')
                        .where('nconst', id)
                        .select(
                            'primaryName',
                            'birthYear',
                            'deathYear',
                        )
                        .first();

        if (!person)
            return errors.notFoundError(res, 'No record exists of a person with this ID');
            
        const roles = await db('principals as p')
            .join('basics as b', 'p.tconst', 'b.tconst')
            .where('p.nconst', id)
            .select(
                'p.tconst',
                'b.primaryTitle',
                'b.imdbRating',
                'p.category',
                'p.characters'
            );
        
        return res.json({
            name: person.primaryName,
            birthYear: person.birthYear,
            deathYear: person.deathYear,
            roles: roles.map(role => ({
                movieId: role.tconst,
                movieName: role.primaryTitle,
                imdbRating: parser.parseRating(role.imdbRating),
                category: role.category,
                characters: role.characters ? parser.parseCharacters(role.characters) : [],
            })),
        });

    } catch (err) {
        return errors.serverError(res);
    }
};