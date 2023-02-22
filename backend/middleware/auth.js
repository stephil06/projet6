const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        if (req.headers.authorization !== undefined) {
            // console.log("authorization:" + req.headers.authorization);

            // extraire le token à partir du header Authorization de la requête
            const token = req.headers.authorization.split(' ')[1]; // pour enlever la chaîne avant le ' ' i.e 'Bearer '

            // décoder le token via la methode verify & la clé RANDOM_TOKEN_SECRET 
            // (si la clé n'est pas valide, une erreur sera générée)
            const decodedToken = jwt.verify(token, process.env.RANDOM_TOKEN_SECRET);

            // extraire du token le userId
            const userId = decodedToken.userId;
            // ajouter à l'objet Request le userId du token afin que nos différentes routes puissent l’utiliser
            // => via req.auth.userId
            req.auth = {
                userId: userId
            };
            next();
        }
        else {
            res.status(401).json({ error: "L'utilisateur n'est pas connecté !" });
        }

    } catch (error) {
        // codeHTTP 401 : "utilisateur non authentifié"
        res.status(401).json({ error });
    }
};
