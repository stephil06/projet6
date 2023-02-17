// cf. https://dev.to/brunohgv/limiting-node-js-api-calls-with-express-rate-limit-11kl

const rateLimit = require("express-rate-limit"); // precondition:  npm install express-rate-limit

// pour limiter le nombre de connexions de l'API login : à 3 requêtes toutes les 5 minutes (pour chaque IP)
// Si dépassement affiche le message d'erreur { erreur: 'Trop de connexions. Le compte est bloqué 5 minutes' }
const loginLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 3, // Limiter chaque IP à 3 requêtes par windowMs (i.e 5 minutes)
    // message: "Trop de connexion. Le compte est bloqué 5 minutes !"
    handler: function (req, res) {
        // codeHTTP 429 "Too Many Requests"
        return res.status(429).json({ erreur: "L'utilisateur n'est pas connecté ! Il y a eu trop de connexions."
            + " Le compte est bloqué 5 minutes." });
    }

});

module.exports = { loginLimiter };
