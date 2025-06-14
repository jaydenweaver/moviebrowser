exports.parseCharacters = (list) => {
    if (!list || typeof list !== 'string') 
        return [];

    try {
        const parsed = JSON.parse(list);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

exports.parseRating = (value) => {
    if (typeof value !== 'string') return null;

    const match = value.match(/^(\d+(\.\d+)?)/);
    if (!match)
        return null;

    return parseFloat(match[1]);
};