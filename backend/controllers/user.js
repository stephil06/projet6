
// -----------------------------------------------------------------------------------------------
// ----- Require ---------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------

const bcrypt = require('bcrypt'); // Hacher le mot de passe
const jwt = require('jsonwebtoken'); // créer les tokens d'authentification; precondition : npm install jsonwebtoken

const User = require('../models/user'); // importer le model User

// -----------------------------------------------------------------------------------------------
// ----- USER : implémenter les 2 méthodes POST de notre API -------------------------------------
// -----------------------------------------------------------------------------------------------

/* Ajouter à la DB 1 USER à partir des données du body
  => Via l'outil Postman :
     Méthode POST
     Body raw JSON
     {
      "email": "toto@gmail.com",
      "password": "pwd"
      }
  puis SEND
*/
/* myRouter.route('/api/auth/signup')
  .post(function (req, res) { */

// signup : inscrire l'utilisateur

exports.signup = (req, res, next) => {
  console.log(req.body);

  bcrypt.hash(req.body.password, 10) // saler 10 fois
    .then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash
      });
      // insérer le user dans la BD
      user.save()
        .then(() => res.status(201).json({ message: "L'utilisateur a été ajouté en base de données" }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

// login : identifier l'utilisateur
/* myRouter.route('/api/auth/login')
  .post(function (req, res) { */

/* => Via l'outil Postman :
Méthode POST
Body raw JSON
{
 "email": "TOi@gmail.com",
 "password": "pwd455"
 }
puis SEND
*/
exports.login = (req, res, next) => {
  console.log(req.body);

  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({ erreur: "L'utilisateur est inconnu dans la base de données" }); // erreur401 Unauthorized
      }
      // fonction compare de bcrypt pour comparer le mot de passe entré par l'utilisateur avec le hash enregistré dans la base de données
      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            return res.status(401).json({ erreur: "Mot de passe différent" });
          }

          res.status(200).json({
            userId: user._id,
            // fonction sign de jsonwebtoken pour chiffrer un nouveau token
            token: jwt.sign(
                { userId: user._id },
                // chaîne secrète pour chiffrer notre token
                'RANDOM_TOKEN_SECRET',
                //  durée de validité du token à 24 heures
                { expiresIn: '24h' }
            )
        });





          /*
          // Créer un token signé cf. https://medium.com/@sbesnier1901/s%C3%A9curiser-une-api-avec-node-js-et-jwt-15e14d9df109
          const expiresIn = 24 * 60 * 60;
          const newToken = jwt.sign({
            user: user._id
          },
            'SECRET_KEY',
            {
              expiresIn: expiresIn
            });

          //  res.header('Authorization', 'Token :' + newToken);

          res.status(200).json({
            userId: user._id,
            token: newToken
          }); */
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));

};