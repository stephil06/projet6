
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        console.log(req.headers.authorization);
        const token = req.headers.authorization.split(' ')[1]; // on extrait le token du header Authorization de la requête entrante

        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET'); // fonction verify pour décoder notre token. Si celui-ci n'est pas valide, une erreur sera générée
        const userId = decodedToken.userId; console.log(userId);
        // Ajout à l'objet Request de l'ID utilisateur du token afin que nos différentes routes puissent l’utiliser
        req.auth = {
            userId: userId
        };
        next();
    } catch (error) {
        res.status(401).json({ error });
    }
};
