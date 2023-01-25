// L'application requiert l'utilisation du module Express
// La variable express nous permettra d'utiliser les fonctions du module Express  
var express = require('express');

// On définit les paramètres du serveur
const hostname = 'localhost';
const port = 3000;

// On crée un objet de type Express
var app = express();

// Utilisation de l'objet body-parser
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Afin de faciliter le routage (les URL que nous souhaitons prendre en charge dans notre API), on crée un objet Router
// C'est à partir de cet objet myRouter, que nous allons implémenter les méthodes
var myRouter = express.Router();

// ----- Route /
myRouter.route('/')
  // all permet de prendre en charge toutes les méthodes
  .all(function (req, res) {
    res.json({ message: "Bienvenue sur notre Frugal API", methode: req.method });
  });

// ----- Route /piscines
myRouter.route('/piscines')
  // Implémentation des méthodes GET, POST, PUT & DELETE
  // GET
  // eg. http://localhost:3000/piscines?ville=Roubaix&maxresultat=2
  .get(function (req, res) {
    res.json({
      message: "LISTE les piscines de Lille Métropole avec paramètres :",
      ville: req.query.ville,
      nbResultat: req.query.maxresultat,
      methode: req.method
    });
  })

  // POST
  // Utilisation via Postman :  Méthode POST & URL : http://localhost:3000/piscines/
  /*                            Body : x-www-form-url-encoded
                                  KEY : nom     VALUE : PISCINE OLYMP
                                        ville   VALUE : Lille3
                                        taille  VALUE : 50
  */
  .post(function (req, res) {
    res.json({
      message: "AJOUTE une nouvelle piscine à la liste",
      nom: req.body.nom, // Utilisation de l'objet body-parser cf. ligne 15
      ville: req.body.ville,
      taille: req.body.taille,
      methode: req.method
    });
  })

  // PUT
  .put(function (req, res) {
    res.json({ message: "MISE A JOUR des informations d'une piscine dans la liste", methode: req.method });
  })
  // DELETE
  .delete(function (req, res) {
    res.json({ message: "SUPPRESSION d'une piscine dans la liste", methode: req.method });
  });



// Configuration d'une route pour l'accès à la ressource PISCINES à partir de son identifiant
myRouter.route('/piscines/:piscine_id')
  .get(function (req, res) {
    res.json({ message: "Vous souhaitez ACCEDER aux informations de la piscine n°" + req.params.piscine_id });
  })
  .put(function (req, res) {
    res.json({ message: "Vous souhaitez MODIFIER les informations de la piscine n°" + req.params.piscine_id });
  })
  .delete(function (req, res) {
    res.json({ message: "Vous souhaitez SUPPRIMER la piscine n°" + req.params.piscine_id });
  });



// On demande à l'application d'utiliser le routeur
app.use(myRouter);

// on démarre le serveur 
app.listen(port, hostname, function () {
  console.log("Mon serveur fonctionne sur http://" + hostname + ":" + port);
});


