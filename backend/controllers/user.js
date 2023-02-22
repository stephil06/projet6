
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

/* Retourne true Ssi le mot de passe pwd passé en argument est fort
 cf. https://askcodez.com/expression-reguliere-pour-la-validation-du-mot-de-passe.html
*/
const isMotDePasseFort = (pwd) => {
  // Le Mot de passe est fort : Il doit contenir minimum 8 caractères & au moins 1 lettre alphabétique minuscule & au moins 1 majuscule 
  // & au moins 1 chiffre & au moins 1 caractère spécial
  const paswd = /^.*(?=.{8,})(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!#$%&?"]).*$/;
  return pwd.match(paswd) ? true : false;
}

/* A partir du body raw JSON 
     eg. {
      "email": "pcRaTOPz@po.fr",
      "password": "aZeertrty4!"
        }
  - Si le mot de passe est fort :
      - insère l'email (en minuscules via lowercase de mongoose.Schema) & le password chiffré (via bcrypt.hash() ) 
        dans "users" de la base de données
      - retourne { message: "L'utilisateur a été ajouté en base de données" } 
  - Sinon :
      - retourne { erreur: "Le Mot de passe n'est pas assez fort ! } 
  - Si erreur : Retourne { error }
*/
// signup : inscrire l'utilisateur
exports.signup = (req, res, next) => {

  if (isMotDePasseFort(req.body.password)) {

    bcrypt.hash(req.body.password, 10) // saler 10 fois
      .then(hash => {
        const user = new User({
          email: req.body.email,
          password: hash
        });
        // insérer le user dans la BD
        user.save()
          // codeHTTP 201 (OK) : "Requête traitée avec succès et création d’un document."
          .then(() => res.status(201).json({ message: "L'utilisateur a été ajouté en base de données" }))
          .catch(error => res.status(400).json({ error }));
      })
      // // codeHTTP 500 : "Erreur interne du serveur"
      .catch(error => res.status(500).json({ error }));
  }
  else {
    // codeHTTP 400 : "La syntaxe de la requête est erronée"
    return res.status(400).json({ erreur: "Le Mot de passe doit contenir minimum 8 caractères & au moins 1 lettre alphabétique minuscule & au moins 1 majuscule & au moins 1 chiffre & au moins 1 caractère spécial)" });
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

  User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          // Quand les identifiants sont faux, mettre un message d'erreur qui ne donne pas d'indice sur l'email
          // return res.status(401).json({ erreur: "L'utilisateur est inconnu dans la base de données" } ); 
         // codeHTTP 401 : "utilisateur non authentifié"
          return res.status(401).json({ erreur: "L'utilisateur n'est pas connecté ! Login (email; password) incorrect !" }); // erreur401 Unauthorized
        }
        // fonction compare de bcrypt pour comparer le mot de passe entré par l'utilisateur avec le hash enregistré dans la base de données
        bcrypt.compare(req.body.password, user.password)
          .then(valid => {
            if (!valid) {
              // Quand les identifiants sont faux, mettre un message d'erreur qui ne donne pas d'indice sur l'email
              // return res.status(401).json({ erreur: "Mot de passe différent" });
              // codeHTTP 401 : "utilisateur non authentifié"
              return res.status(401).json({ erreur: "L'utilisateur n'est pas connecté ! Login (email; password) incorrect !" });
            }
            // codeHTTP 200 (OK) : "succès de la requête"
            res.status(200).json({
              userId: user._id,
              // fonction sign de jsonwebtoken pour chiffrer un nouveau token
              // Créer un token signé cf. https://medium.com/@sbesnier1901/s%C3%A9curiser-une-api-avec-node-js-et-jwt-15e14d9df109
              token: jwt.sign(
                { userId: user._id },
                // chaîne secrète pour chiffrer notre token
                process.env.RANDOM_TOKEN_SECRET,
                //  durée de validité du token à 24 heures
                { expiresIn: '24h' }
              )
            });

          })
          // codeHTTP 500 : "Erreur interne du serveur"
          .catch(error => res.status(500).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
 
};