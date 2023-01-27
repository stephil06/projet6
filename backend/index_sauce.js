// Node.js : permet d’utiliser le langage JavaScript côté serveur
// Express : framework (qui s’appuie sur Node.js) fournissant un ensemble de fonctions pour faciliter le développement d’applications

// pour installer le module Express ( Depuis le dossier "backend") :  exécuter npm install express --save
// Depuis le dossier "backend" : exécuter nodemon index_sauce.js

// -----------------------------------------------------------------------------------------------
// ----- Require ---------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------
const express = require('express'); const app = express();

// La variable mongoose nous permettra d'utiliser les fonctions du module/framework MongoDB "mongoose"
// precondition : l'installer (npm install mongoose --save)
const mongoose = require('mongoose'); mongoose.set('strictQuery', true);

// pour gérer l'unicité
const uniqueValidator = require('mongoose-unique-validator'); // precondition : npm install mongoose-unique-validator --force

// pour le hachage du mot de passe
const bcrypt = require('bcrypt'); // precondition : npm install bcrypt

// pour la gestion des tokens
const jwt = require('jsonwebtoken'); // precondition : npm install jsonwebtoken --save

// -----------------------------------------------------------------------------------------------
// ----- Couche Base de Données ------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------

// on se connecte à la base de données MongoDB (Atlas)
const user = 'stephil06'; const pwd = '9ys=cifz';
const urlMongo = `mongodb+srv://${user}:${pwd}@cluster0.u7l9pec.mongodb.net/?retryWrites=true&w=majority`;
console.log(urlMongo);
mongoose.connect(urlMongo,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// Pour modéliser les données, le framework mongoose utilise des "schémas" ; on crée donc un modèle de données pour les USER & pour les SAUCE :

/* USER :
  ● email : String — adresse e-mail de l'utilisateur [unique]
  ● password : String — mot de passe de l'utilisateur haché
*/
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
userSchema.plugin(uniqueValidator);

const User = mongoose.model('User', userSchema);

/* SAUCE :
  ● userId : String — l'identifiant MongoDB unique de l'utilisateur qui a créé la sauce
  ● name : String — nom de la sauce
  ● manufacturer : String — fabricant de la sauce
  ● description : String — description de la sauce
  ● mainPepper : String — le principal ingrédient épicé de la sauce
  ● imageUrl : String — l'URL de l'image de la sauce téléchargée par l'utilisateur
  ● heat : Number — nombre entre 1 et 10 décrivant la sauce
  ● likes : Number — nombre d'utilisateurs qui aiment (= likent) la sauce
  ● dislikes : Number — nombre d'utilisateurs qui n'aiment pas (= dislike) la sauce
  ● usersLiked : [ "String <userId>" ] — tableau des identifiants des utilisateurs qui ont aimé (= liked) la sauce
  ● usersDisliked : [ "String <userId>" ] — tableau des identifiants des utilisateurs qui n'ont pas aimé (= disliked) la sauce
*/

const sauceSchema = mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  manufacturer: { type: String, required: true },
  description: { type: String, required: true },
  mainPepper: { type: String, required: true },
  imageUrl: { type: String, required: true },
  heat: { type: Number, min: 1, max: 10, required: true },
  likes: { type: Number, min: 0, required: false, default: 0 },
  dislikes: { type: Number, min: 0, required: false, default: 0 },
  usersLiked: [{ type: String, required: false, default: [] }],
  usersDisliked: [{ type: String, required: false, default: [] }],
});

const Sauce = mongoose.model('Sauce', sauceSchema);

const myRouter = express.Router();

myRouter.route('/')
  .all(function (req, res) {
    res.status(200).json({ message: "Bienvenue sur notre API PIIQUANTE", methode: req.method });
  });

// Utilisation de l'objet body-parser pour utiliser le body
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// -----------------------------------------------------------------------------------------------
// ----- USER : implémenter les 2 méthodes POST de notre API -------------------------------------
// -----------------------------------------------------------------------------------------------

/* Ajouter à la DB 1 USER à partir des données du body
  => Via l'outil Postman :
     Méthode POST
     body x-form-wrlencoded :
        KEY     email               VALUE toto@gmail.com
                password            VALUE pwd254
  puis SEND
*/
myRouter.route('/api/auth/signup')
  .post(function (req, res) {

    bcrypt.hash(req.body.password, 10) // saler 10 fois
      .then(hash => {
        const user = new User({
          email: req.body.email,
          password: hash
        });
        // insérer le user dans la BD
        user.save()
          .then(() => res.status(201).json({ message: `L'utilisateur (avec l'identifiant _id: ${user._id}) a été ajouté en base de données` }))
          .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
  });

myRouter.route('/api/auth/login')
  .post(function (req, res) {

    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          return res.status(401).json({ erreur: `L'utilisateur (ayant pour email: ${req.body.email}) est inconnu dans la base de données` });
        }
        bcrypt.compare(req.body.password, user.password)
          .then(valid => {
            if (!valid) {
              return res.status(401).json({ erreur: 'Mot de passe différent' });
            }
            // Créer un token signé cf. https://medium.com/@sbesnier1901/s%C3%A9curiser-une-api-avec-node-js-et-jwt-15e14d9df109
            const expiresIn = 24 * 60 * 60;
            const newToken = jwt.sign({
              user: user._id // decoded.user
            },
              'SECRET_KEY',
              {
                expiresIn: expiresIn
              });

            //  res.header('Authorization', 'Token :' + newToken);

            res.status(200).json({
              userId: user._id,
              token: newToken
            });
          })
          .catch(error => res.status(500).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));

  });

// -----------------------------------------------------------------------------------------------
// ----- SAUCE : implémenter chacune des méthodes (GET, POST, PUT, DELETE) de notre API ----------
// -----------------------------------------------------------------------------------------------

myRouter.route('/api/sauces')
  .get(function (req, res) {
    // fonction Mongoose pour trouver tous (la collection) les documents (i.e Sauce) 
    Sauce.find(function (err, sauces) {
      if (err) {
        res.status(400).json({ erreur: err });
      }
      res.status(200).json(sauces);
    });
  })

  .post(function (req, res) {
    // on utilise le schéma sauce
    const sauce = new Sauce(); console.log(sauce);
    // on récupére les données du body pour les ajouter à l'objet Sauce
    // cela suppose le "bodyParser"
    sauce.userId = req.body.userId;
    sauce.name = req.body.name;
    sauce.manufacturer = req.body.manufacturer;
    sauce.description = req.body.description;
    sauce.mainPepper = req.body.mainPepper;
    sauce.imageUrl = `${req.protocol}://${req.get('host')}/images/sauce_1.jpg}`; // req.body.imageUrl;
    sauce.heat = req.body.heat;
    console.log(`${req.protocol}://${req.get('host')}/images/${req.file}`); // URL de l'image uploadée

    // on stocke l'objet sauce en base
    sauce.save(function (err) {
      if (err) {
        res.status(400).json({ erreur: err });
      }
      res.status(201).json({ message: `La sauce (avec l'identifiant _id: ${sauce._id}) a été ajoutée en base de données` });
    })
  });


myRouter.route('/api/sauces/:id')

  // interroger la DB pour retourner la sauce ayant pour identifiant : id
  .get(function (req, res) {
    // fonction Mongoose pour chercher un document par son identifiant
    Sauce.findById(req.params.id, function (err, sauce) {
      if (err)
        res.status(400).json({ erreur: err });
      res.status(200).json(sauce);
    });
  })

  // Supprimer la sauce ayant pour identifiant : id
  .delete(function (req, res) {
    // fonction Mongoose pour supprimer un document par son identifiant
    // Sauce.remove({ _id: req.params.id }, function (err, sauce) { : remove() est deprecated
    Sauce.deleteOne({ _id: req.params.id }, function (err, sauce) {
      if (err) {
        res.status(400).json({ erreur: err });
      }
      res.status(200).json({ message: `La sauce ${req.params.id} est supprimée de la base de données` });
    });

  })

  // Modifier les données de la Sauce ayant pour identifiant : id
  .put(function (req, res) {
    // rechercher la sauce ayant pour identifiant id
    Sauce.findById(req.params.id, function (err, sauce) {
      if (err) {
        res.send(err);
      }
      // on récupére les données du body pour mettre à jour l'objet Sauce
      // cela suppose le "bodyParser"
      sauce.userId = req.body.userId;
      sauce.name = req.body.name;
      sauce.manufacturer = req.body.manufacturer;
      sauce.description = req.body.description;
      sauce.mainPepper = req.body.mainPepper;
      sauce.imageUrl = req.body.imageUrl;
      sauce.heat = req.body.heat;
      // on stocke l'objet Sauce en base
      sauce.save(function (err) {
        if (err) {
          res.status(400).json({ erreur: err });
        }
        // Si tout est ok
        res.status(200).json({ message: `La sauce ${req.params.id} a été mise à jour dans la base de données` });
      });
    });
  })

// on demande à l'application d'utiliser notre routeur
app.use(myRouter);

// Définir les paramètres du serveur
const hostname = 'localhost';
const port = 3000;

// Démarrer le serveur 
app.listen(port, hostname, function () {
  console.log(`Le serveur fonctionne sur http://${hostname}:${port}\n`);
});

/* Pour tester :
    1. Dans le dossier backend : nodemon index_sauce.js
    2. Dans 1 navigateur (eg. Firefox) : http://localhost:3000/api/sauces/
    OU Dans Postman : http://localhost:3000/
*/
