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

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(helmet());


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
