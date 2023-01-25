// Node.js : permet d’utiliser le langage JavaScript côté serveur
// Express : framework (qui s’appuie justement sur Node.js) fournissant un ensemble de fonctions pour faciliter le développement d’applications

// pour installer le module Express ( Depuis le dossier "backend") :  exécuter npm install express --save
// Depuis le dossier "backend" : exécuter nodemon index_avec_mongoose.js

const express = require('express'); const app = express();

// La variable mongoose nous permettra d'utiliser les fonctions du module/framework MongoDB "mongoose"
// precondition : l'installer (npm install mongoose --save)
const mongoose = require('mongoose'); mongoose.set('strictQuery', true);


// mongoose.connect(urlmongo, options);
/*
var db = mongoose.connection; 
db.on('error', console.error.bind(console, 'Erreur lors de la connexion')); 
db.once('open', function (){
   console.log("Connexion à la base OK"); 
});
*/

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

// Pour modéliser les données, le framework mongoose utilise des "schémas" ; on crée donc un modèle de données :
const piscineSchema = mongoose.Schema({
  nom: String,
  adresse: String,
  tel: String,
  description: String
});

const Piscine = mongoose.model('Piscine', piscineSchema);

const myRouter = express.Router();

myRouter.route('/')
  .all(function (req, res) {
    res.json({ message: "Bienvenue sur notre API", methode: req.method });
  });

// Utilisation de l'objet body-parser pour utiliser le body
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// -----------------------------------------------------------------------------------------------
// ----- implémenter chacune des méthodes (GET, POST, PUT, DELETE) de notre API ------------------
// -----------------------------------------------------------------------------------------------

// interroger la DB pour retourner toutes les piscines
// Si piscine  a 0 élément : retourne 1 tableau vide
myRouter.route('/piscines')
  .get(function (req, res) {
    // fonction Mongoose pour trouver tous (la collection) les documents (i.e Piscine) 
    Piscine.find(function (err, piscines) {
      if (err) {
        res.send(err);
      }
      res.json(piscines);
    });
  })

  // Ajouter à la DB 1 piscine à partir des données du body
  // => Via l'outil Postman :
  // methode POST
  // body x-form-wrlencoded :
  // KEY    nom               VALUE d1
  //        adresse                 d2
  //        tel                     d3
  //        description             d4
  // puis SEND
  .post(function (req, res) {
    // on utilise le schéma Piscine
    const piscine = new Piscine(); console.log(piscine);
    // on récupére les données du body pour les ajouter à l'objet Piscine
    // cela suppose le "bodyParser"
    piscine.nom = req.body.nom;
    piscine.adresse = req.body.adresse;
    piscine.tel = req.body.tel;
    piscine.description = req.body.description;
    // on stocke l'objet Piscine en base
    piscine.save(function (err) {
      if (err) {
        res.send(err);
      }
      res.send({ message: `La piscine (avec l'identifiant _id: ${piscine._id}) a été ajoutée en base de données` });
    })
  });

myRouter.route('/piscines/:piscine_id')

  // interroger la DB pour retourner la piscine ayant pour identifiant : piscine_id
  .get(function (req, res) {
    // fonction Mongoose pour chercher un document par son identifiant
    Piscine.findById(req.params.piscine_id, function (err, piscine) {
      if (err)
        res.send(err);
      res.json(piscine);
    });
  })

  // Modifier les données de la Piscine ayant pour identifiant : piscine_id
  .put(function (req, res) {
    // rechercher la piscine ayant pour identifiant piscine_id
    Piscine.findById(req.params.piscine_id, function (err, piscine) {
      if (err) {
        res.send(err);
      }
      // on récupére les données du body pour mettre à jour l'objet Piscine
      // cela suppose le "bodyParser"
      piscine.nom = req.body.nom;
      piscine.adresse = req.body.adresse;
      piscine.tel = req.body.tel;
      piscine.description = req.body.description;
      // on stocke l'objet Piscine en base
      piscine.save(function (err) {
        if (err) {
          res.send(err);
        }
        // Si tout est ok
        res.json({ message: `La piscine ${req.params.piscine_id} a été mise à jour dans la base de données` });
      });
    });
  })

  // Supprimer la Piscine ayant pour identifiant : piscine_id
  .delete(function (req, res) {
    // fonction Mongoose pour supprimer un document par son identifiant
    Piscine.remove({ _id: req.params.piscine_id }, function (err, piscine) {
      if (err) {
        res.send(err);
      }
      res.json({ message: `La piscine ${req.params.piscine_id} est supprimée de la base de données` });
    });

  });

// on demande à l'application d'utiliser notre routeur
app.use(myRouter);

// Définir les paramètres du serveur
const hostname = 'localhost';
const port = 3000;

// Démarrer le serveur 
app.listen(port, hostname, function () {
  console.log(`Le serveur fonctionne sur http://${hostname}:${port}\n`);
});




/*
// app.get('/parkings', (req, res) => { res.send("Liste des parkings"); });
// app.listen(8080, () => { console.log("Serveur à l'écoute"); });


// const express = require('express'); const app = express();
const parkings = require('./parkings.json');

// Middleware
app.use(express.json());

app.get('/parkings', (req, res) => { res.status(200).json(parkings); });
// app.listen(8080, () => { console.log("Serveur à l'écoute"); });



// const express = require('express')const app = express()const parkings = require('./parkings.json')app.get('/parkings', (req, res) => { res.status(200).json(parkings) })


app.get('/parkings/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const parking = parkings.find(parking => parking.id === id);
  res.status(200).json(parking);
});

app.post('/parkings', (req, res) => { parkings.push(req.body); res.status(200).json(parkings); });

app.put('/parkings/:id', (req, res) => {
  const id = parseInt(req.params.id);
  let parking = parkings.find(parking => parking.id === id);
  parking.name = req.body.name; parking.city = req.body.city; parking.type = req.body.type;
  res.status(200).json(parking);
});

app.delete('/parkings/:id', (req, res) => {
  const id = parseInt(req.params.id);
  let parking = parkings.find(parking => parking.id === id);
  parkings.splice(parkings.indexOf(parking)); // , 1);
  res.status(200).json(parkings);
});

app.listen(8080, () => { console.log("Serveur à l'écoute") })



// const express = require('express'); const app = express(); const parkings = require('./parkings.json');
// Middleware app.use(express.json()); // app.get('/parkings', (req,res) => {    res.status(200).json(parkings)}); app.get('/parkings/:id', (req,res) => {    const id = parseInt(req.params.id)    const parking = parkings.find(parking => parking.id === id)    res.status(200).json(parking)})app.listen(8080, () => {    console.log("Serveur à l'écoute")})



*/

/* Pour tester :
    1. Dans le dossier backend : node server
    2. Dans 1 navigateur (eg. Firefox) : http://localhost:3000/
    OU Dans Postman : http://localhost:3000/
*/

// importez le package ou Module HTTP natif de Node
// NB: require()  nous permet d'omettre l'extension  .js



/*
const http = require('http');

// créer un serveur Node via la methode createServer() du package http
const server = http.createServer( (req, res) => {
    res.end('Voilà la réponse du serveur !');
});

// configurer le serveur pour qu'il écoute le port par défaut OU port 3000
server.listen(process.env.PORT || 3000); // port par défaut OU port 3000
*/


/*

const http = require('http');
const app = require('./app');

app.set('port', process.env.PORT || 3000);
const server = http.createServer(app);

server.listen(process.env.PORT || 3000);
*/














/*
const http = require('http');
const app = require('./app');

const normalizePort = val => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

const errorHandler = error => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use.');
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const server = http.createServer(app);

server.on('error', errorHandler);
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
});

server.listen(port);

*/




