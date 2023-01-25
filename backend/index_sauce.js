// Node.js : permet d’utiliser le langage JavaScript côté serveur
// Express : framework (qui s’appuie justement sur Node.js) fournissant un ensemble de fonctions pour faciliter le développement d’applications

// pour installer le module Express ( Depuis le dossier "backend") :  exécuter npm install express --save
// Depuis le dossier "backend" : exécuter nodemon index_avec_mongoose.js

const express = require('express'); const app = express();

// La variable mongoose nous permettra d'utiliser les fonctions du module/framework MongoDB "mongoose"
// precondition : l'installer (npm install mongoose --save)
const mongoose = require('mongoose'); mongoose.set('strictQuery', true);

// pour gérer l'unicité
const uniqueValidator = require('mongoose-unique-validator'); // precondition : npm install mongoose-unique-validator --force

// pour le hachage du mot de passe
const bcrypt = require('bcrypt'); // precondition : npm install bcrypt

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

/*
Utilisateur
● email : String — adresse e-mail de l'utilisateur [unique]
● password : String — mot de passe de l'utilisateur haché
*/
const userSchema = mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true }
});
userSchema.plugin(uniqueValidator);

const User = mongoose.model('User', userSchema);



/* 
  userId : String — l'identifiant MongoDB unique de l'utilisateur qui a créé la sauce
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

const Piscine = mongoose.model('Piscine', piscineSchema);

const myRouter = express.Router();

myRouter.route('/')
  .all(function (req, res) {
    res.status(200).json({ message: "Bienvenue sur notre API", methode: req.method });
  });

// Utilisation de l'objet body-parser pour utiliser le body
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// -----------------------------------------------------------------------------------------------
// ----- USER : implémenter chacune des méthodes (GET, POST, PUT, DELETE) de notre API -----------
// -----------------------------------------------------------------------------------------------

myRouter.route('/api/auth/signup')
  .post(function (req, res) {
    // on utilise le schéma sauce
    // const sauce = new Sauce(); console.log(sauce);
    /* const user = new User({
      email: req.body.email,
      password: req.body.password
    });
    console.log(user); */

    // on stocke l'objet user en base
    /* user.save(function (err) {
        if (err) {
          // res.send(err);
          res.status(400).json({ erreur: err });
        }
        // res.send({ message: `La sauce (avec l'identifiant _id: ${sauce._id}) a été ajoutée en base de données` });
        res.status(201).json({ message: `L'utilisateur (avec l'identifiant _id: ${user._id}) a été ajouté en base de données` });
      }) */

    bcrypt.hash(req.body.password, 10) // saler 10 fois
      .then(hash => {
        const user = new User({
          email: req.body.email,
          password: hash
        });
        user.save() // insérer le user dans la BD
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
          return res.status(401).json({ erreur: 'Utilisateur (Email) inconnu dans la base de données' });
        }
        bcrypt.compare(req.body.password, user.password)
          .then(valid => {
            if (!valid) {
              return res.status(401).json({ erreur: 'Mot de passe différent' });
            }
            res.status(200).json({
              userId: user._id,
              token: 'TOKEN'
            });
          })
          .catch(error => res.status(500).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));

  });

myRouter.route('/api/sauces')
  .get(function (req, res) {
    // fonction Mongoose pour trouver tous (la collection) les documents (i.e Sauce) 
    Sauce.find(function (err, sauces) {
      if (err) {
        // res.status(400).res.send(err);
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

    // const sauceObject = JSON.parse(req.body.sauce); 
    /*
      const sauceObject = JSON.parse(req.body.sauce); // Transforme le JSON en objet JS
      const sauce = new Sauce({ // Déclaration d'un nouvel objet sauce
          ...sauceObject, // Copie les éléments de req.body
          imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` // URL de l'image uploadée
      }); */

    // on stocke l'objet sauce en base
    sauce.save(function (err) {
      if (err) {
        // res.send(err);
        res.status(400).json({ erreur: err });
      }
      // res.send({ message: `La sauce (avec l'identifiant _id: ${sauce._id}) a été ajoutée en base de données` });
      res.status(201).json({ message: `La sauce (avec l'identifiant _id: ${sauce._id}) a été ajoutée en base de données` });
    })
  });


myRouter.route('/api/sauces/:id')

  // interroger la DB pour retourner la piscine ayant pour identifiant : piscine_id
  .get(function (req, res) {
    // fonction Mongoose pour chercher un document par son identifiant
    Sauce.findById(req.params.id, function (err, sauce) {
      if (err)
        // res.status(400).send(err);
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
        // res.send(err);
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
          // res.send(err);
          res.status(400).json({ erreur: err });
        }
        // Si tout est ok
        res.status(200).json({ message: `La sauce ${req.params.id} a été mise à jour dans la base de données` });
      });
    });
  })




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




