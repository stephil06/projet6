
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


/* Retourne true Ssi le mot de passe pwd passé en argument est fort
 cf. https://askcodez.com/expression-reguliere-pour-la-validation-du-mot-de-passe.html
*/
const isMotDePasseFort = (pwd) => {
  // Le Mot de passe est fort : Il doit contenir minimum 8 caractères & au moins 1 lettre alphabétique minuscule & au moins 1 majuscule 
  // & au moins 1 chiffre & au moins 1 caractère spécial
  const paswd = /^.*(?=.{8,})(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!#$%&?"]).*$/;
  return pwd.match(paswd) ? true : false;
}

exports.signup = (req, res, next) => {
  console.log(req.body);

  if (isMotDePasseFort(req.body.password)) {
    console.log("Mot de passe fort");

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
  }
  else {
    return res.status(400).json({ erreur: "Le Mot de passe n'est pas assez fort ! (Il doit contenir minimum 8 caractères & au moins 1 lettre alphabétique minuscule & au moins 1 majuscule & au moins 1 chiffre & au moins 1 caractère spécial)" });
  }
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

/* - Retourne { "userId" ; "token" } 
  où userId désigne le _id du document Users (Base de Données) 
  où token désigne le token généré à partir de la variable d'environnement RANDOM_TOKEN_SECRET (chaîne secrète pour chiffrer le token)
      (le token généré est valable 24H).
  - Retourne { "erreur": "Login (email; password) incorrect !"} Si identifiants incorrects
*/
exports.login = (req, res, next) => {
  console.log(req.body);

  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        // Quand les identifiants sont faux, mettre un message d'erreur qui ne donne pas d'indice sur l'email
        // return res.status(401).json({ erreur: "L'utilisateur est inconnu dans la base de données" } ); 
        return res.status(401).json({ erreur: "Login (email; password) incorrect !" } ); // erreur401 Unauthorized
      }
      // fonction compare de bcrypt pour comparer le mot de passe entré par l'utilisateur avec le hash enregistré dans la base de données
      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            // Quand les identifiants sont faux, mettre un message d'erreur qui ne donne pas d'indice sur l'email
            // return res.status(401).json({ erreur: "Mot de passe différent" });
            return res.status(401).json({ erreur: "Login (email; password) incorrect !" });
          }

          res.status(200).json({
            userId: user._id,
            // fonction sign de jsonwebtoken pour chiffrer un nouveau token
            token: jwt.sign(
              { userId: user._id },
              // chaîne secrète pour chiffrer notre token
              // 'RANDOM_TOKEN_SECRET',
              process.env.RANDOM_TOKEN_SECRET,
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