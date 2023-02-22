const express = require('express'); const app = express();

const path = require('path'); //  pour accéder au path de notre serveur

// La constante mongoose pour utiliser les fonctions du package MongoDB "mongoose"
// precondition : l'installer (npm install mongoose --save)
const mongoose = require('mongoose'); mongoose.set('strictQuery', true);

const helmet = require("helmet"); // npm install --save helmet

// Utilisation de l'objet body-parser pour utiliser le body
const bodyParser = require('body-parser');

const sauceRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');

require('dotenv').config(); // precondition  : installer le package dotenv : npm install --save dotenv
// Dans le fichier .env, on met VARIABLE_SECRETE_I=valeurI (dont la valeur est accessible via process.env.VARIABLE_SECRETE_I)
// Attention : Ce fichier .env ne doit pas être poussé sur votre dépôt git => le fichier .env est ajouté au fichier .gitignore
// créer une copie du fichier .env.dist et l'appeler .env, et y mettre la configuration. (notamment MongoDB)
// -----------------------------------------------------------------------------------------------

// on se connecte à la base de données MongoDB (Atlas)
const urlMongo = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/?retryWrites=true&w=majority`;

mongoose.connect(urlMongo,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// app.use(helmet());
// Pour toutes les requêtes : utilisation du package 'helmet' 
// pour sécuriser les en-têtes HTTP contre les attaques (eg. cross-site scripting)
// app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' } }));

// app.use(helmet.frameguard({ action: "SAMEORIGIN" }));


//  CORS est le mécanisme qui permet aux navigateurs d'accéder à des ressources qu'ils ne pourront pas à l'origine 
// parce que la ressource est d'une origine différente
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use('/images', express.static(path.join(__dirname, 'images'))); // gérer la ressource images de manière statique (un sous-répertoire de notre répertoire de base, __dirname)

// on demande à l'application d'utiliser nos 2 routeurs
app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);

/* Afficher un message d'erreur quand l'endpoint n'existe pas */
// https://www.geeksforgeeks.org/how-to-get-the-full-url-in-expressjs/?ref=rp

app.use('*', function (req, res) {
  /* 
  const url = req.originalUrl;
  const fullUrl = `${protocol}://${host}:${port}${url}`
  */
  res.status(404).json({ erreur: `L'endpoint ${req.originalUrl} n'existe pas` });
});


module.exports = app;
