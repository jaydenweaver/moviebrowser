const db = require('../db');
const errors = require('../utils/errors');
const parser = require('../utils/parser');

exports.getMovies = async (req, res) => {
    const { title, year, page } = req.query;
    const currentPage = parseInt(page) || 1;
    const perPage = 100;
    const offset = perPage * (currentPage - 1);

    if (year && !/^\d{4}$/.test(year)) 
        return errors.validationError(res, 'Invalid year format. Format must be yyyy.');

    if (page && (!Number.isInteger(Number(page)) || Number(page) < 1))
        return errors.validationError(res, 'Invalid page format. page must be a number.');

    try {
        const query = db('basics')
            .select(
                'primaryTitle',
                'year',
                'tconst',
                'imdbRating',
                'rottenTomatoesRating',
                'metacriticRating',
                'rated'
            )
            .orderBy('id', 'asc')
            .limit(perPage)
            .offset(offset);

        if (title) 
            query.where('primaryTitle', 'like', `%${title}%`);

        if (year) 
            query.andWhere('year', year);

        const data = await query;

        const count = db('basics').count('* as total');

        if (title)
            count.where('primaryTitle', 'like', `%${title}%`);

        if (year)
            count.andWhere('year', year);

        const countRes = await count.first();
        const total = countRes?.total || 0;
        const lastPage = Math.ceil(total / perPage);
        let prevPage = currentPage > 1 ? currentPage - 1 : null;
        let nextPage = currentPage < lastPage ? currentPage + 1 : null;

        if (total === 0) {
            prevPage = null;
            nextPage = null;
        }

        return res.json({
                    data: data.map(movie => ({
                        title: movie.primaryTitle,
                        year: movie.year,
                        imdbID: movie.tconst,
                        imdbRating: parseFloat(movie.imdbRating),
                        rottenTomatoesRating: parseFloat(movie.rottenTomatoesRating),
                        metacriticRating: parseFloat(movie.metacriticRating),
                        classification: movie.rated,
                    })),
                    pagination: {
                        total,
                        lastPage,
                        prevPage,
                        nextPage,
                        perPage,
                        currentPage,
                        from: offset,
                        to: offset + data.length,
                    }
                });

    } catch (err) {
        return errors.serverError(res);
    }
};

exports.getMovieData = async (req, res) => {
    const imdbID = req.params.imdbID;

    if (Object.keys(req.query).length > 0) {
        const params = Object.keys(req.query).join(', ');
        return errors.validationError(res, `Invalid query parameters: ${params}. Query parameters are not permitted.`);
    }

    if (!imdbID)
        return errors.validationError(res, 'Missing required imdbID query parameter');

    try {
        const movie = await db('basics')
            .where('tconst', imdbID)
            .select(
                'primaryTitle',
                'year',
                'runtimeMinutes',
                'genres',
                'country',
                'boxoffice',
                'poster',
                'plot'
            )
            .first();
        
        const principals = await db('principals')
            .where('tconst', imdbID)
            .select(
                'nconst',
                'category',
                'name',
                'characters'
            );

        const ratings = await db('ratings')
            .where('tconst', imdbID)
            .select(
                'source',
                'value'
            );

        if (!movie)
            return errors.notFoundError(res, 'No record exists of a movie with this ID');

        return res.json({
                    title: movie.primaryTitle,
                    year: movie.year,
                    runtime: movie.runtimeMinutes,
                    genres: (movie.genres || '').split(',').filter(f => f),
                    country: movie.country,
                    principals: principals.map(principal => ({
                        id: principal.nconst,
                        category: principal.category,
                        name: principal.name,
                        characters: parser.parseCharacters(principal.characters),
                    })),
                    ratings: ratings.map(rating => ({
                        source: rating.source,
                        value: parser.parseRating(rating.value),
                    })),
                    boxoffice: movie.boxoffice,
                    poster: movie.poster,
                    plot: movie.plot,
                });

    } catch (err) {
        return errors.serverError(res);
    }
};