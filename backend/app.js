const express = require('express'); const app = express();

const path = require('path'); //  pour accéder au path de notre serveur

// La variable mongoose nous permettra d'utiliser les fonctions du module/framework MongoDB "mongoose"
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

// const urlMongo = `mongodb+srv://${user}:${pwd}@cluster0.u7l9pec.mongodb.net/?retryWrites=true&w=majority`;
console.log('DB_USER :' + process.env.DB_USER); 
const urlMongo = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.u7l9pec.mongodb.net/?retryWrites=true&w=majority`;
// mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`,

console.log(urlMongo);
mongoose.connect(urlMongo,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(helmet());

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
// app.use(myRouter);
app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;



// Définir les paramètres du serveur
/* const hostname = 'localhost';
const port = 3000;

// Démarrer le serveur 
app.listen(port, hostname, function () {
  console.log(`Le serveur fonctionne sur http://${hostname}:${port}\n`);
});

*/

/* Pour tester :
    1. Dans le dossier backend : nodemon index_sauce.js
    2. Dans 1 navigateur (eg. Firefox) : http://localhost:3000/api/sauces/
    OU Dans Postman : http://localhost:3000/
*/
