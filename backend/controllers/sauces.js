
// -----------------------------------------------------------------------------------------------
// ----- Require ---------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------

const { exit } = require('process');
const Sauce = require('../models/sauces'); // importer le model sauces

const User = require('../models/user'); // importer le model user par rapport à la fonction createSauce()


// -----------------------------------------------------------------------------------------------
// ----- SAUCES : implémenter les méthodes de notre API -------------------------------------
// -----------------------------------------------------------------------------------------------


// Retourner toutes les sauces

exports.getLesSauces = (req, res, next) => {
  Sauce.find().then(sauces => res.status(200).json(sauces)) // Retourne toutes les sauces
    .catch(error => res.status(400).json({ error }));
};

/*
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
*/

// myRouter.route('/api/sauces/:id')

/* Retourner la sauce ayant pour identifiant : id dans la base de données
   Retourner erreur: "La sauce n'existe pas!" si id non valide
*/
exports.getLaSauce = (req, res, next) => {
  /* .get(function (req, res) { */
  // fonction Mongoose pour chercher un document par son identifiant
  Sauce.findById(req.params.id, function (err, sauce) {
    if (err || sauce === null)
      res.status(400).json({ erreur: "La sauce n'existe pas!" });
    else
      res.status(200).json(sauce);
  });
};

// Supprimer la sauce ayant pour identifiant : id
// .delete(function (req, res) {
// fonction Mongoose pour supprimer un document par son identifiant
// Sauce.remove({ _id: req.params.id }, function (err, sauce) { : remove() est deprecated

exports.deleteLaSauce = (req, res, next) => {

  Sauce.deleteOne({ _id: req.params.id }) // On supprime la sauce de la BDD
    .then(() => res.status(200).json({ message: 'Sauce supprimée !' }))
    .catch((error) => res.status(400).json({ error: error }));
};

// créer 1 sauce avec les données du body
exports.createSauce = (req, res, next) => {
  // .post(function (req, res) {
  console.log('ZZ:', req.auth.userId);
  // on recherche (en base de données) si l'utilisateur d'identifiant req.body.userId existe
 User.findById(req.auth.userId, function (err, user) {
    if (err) {
      res.status(400).json({ erreur: err });
    }
    else { 

      // Si l'utilisateur existe, on crée l'objet sauce
      // on utilise le schéma sauce
      const sauce = new Sauce(); console.log(sauce);
      // on récupére les données du body pour les ajouter à l'objet Sauce
      // cela suppose le "bodyParser"
      sauce.userId = req.auth.userId; // req.body.userId;

      sauce.name = req.body.name;
      sauce.manufacturer = req.body.manufacturer;
      sauce.description = req.body.description;
      sauce.mainPepper = req.body.mainPepper;
      sauce.imageUrl = `${req.protocol}://${req.get('host')}/images/sauce_1.jpg}`; // req.body.imageUrl;

      // sauce.imageUrl= `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;

      sauce.heat = req.body.heat;
      console.log(`${req.protocol}://${req.get('host')}/images/${req.file}`); // URL de l'image uploadée

      // on stocke l'objet sauce en base
      sauce.save(function (err) {
        if (err) {
          res.status(400).json({ erreur: err });
        }
        res.status(201).json({ message: "La sauce a été ajoutée en base de données" });
      })

    }
  });

};

// Modifier 1 sauce avec les données du body
exports.updateSauce = (req, res, next) => {
  const sauceObject = { ...req.body };
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: "La sauce est mise à jour" }))
    .catch(error => res.status(400).json({ error }));

};


/* Via l'outil Postman :
Méthode POST - Body raw JSON
{
 "userId": "63ce586c4a3f0a9d5a1de02d",
 "like": -1
 }
puis SEND
*/
// Liker ou Disliker une sauce (ayant pour id req.params.id) par l'utilisateur ayant pour id req.body.userId
exports.likerOuDislikerSauce = (req, res, next) => {

  // on recherche (en base de données) si l'utilisateur d'identifiant req.body.userId existe
  User.findById(req.body.userId, function (err, user) {

    if (err) {
      res.status(400).json({ erreur: err });
    }
    else {

      if (req.body.like === 1) { // l'utilisateur like une sauce

        // rechercher la sauce ayant pour id req.params.id 
        Sauce.findOne({ _id: req.params.id })
          .then(sauce => {
            //  empêcher de liker ou de disliker la même sauce plusieurs fois : un utilisateur ne peut avoir qu'une seule valeur pour chaque sauce
            if (sauce.usersLiked.includes(req.body.userId) || sauce.usersDisliked.includes(req.body.userId)) {
              res.status(400).json({ erreur: "Interdit de liker ou de disliker la même sauce plusieurs fois par un même utilisateur" });
            }
            else {
              // likes +1 & ajout de l'userId dans l'array usersLiked
              Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: 1 }, $push: { usersLiked: req.body.userId } })
                .then((sauce) => res.status(200).json({ message: "Un like supplémentaire" }))
                .catch(error => res.status(400).json({ error }));
            }
          })
          .catch(error => res.status(400).json({ error }));

      } else if (req.body.like === -1) { // l'utilisateur dislike une sauce

        // rechercher la sauce ayant pour id req.params.id 
        Sauce.findOne({ _id: req.params.id })
          .then(sauce => {
            //  empêcher de liker ou de disliker la même sauce plusieurs fois : un utilisateur ne peut avoir qu'une seule valeur pour chaque sauce
            if (sauce.usersLiked.includes(req.body.userId) || sauce.usersDisliked.includes(req.body.userId)) {
              res.status(400).json({ erreur: "Interdit de liker ou de disliker la même sauce plusieurs fois par un même utilisateur" });
            }
            else {

              // dislikes +1 & ajout de l'userId dans l'array usersDisliked  
              Sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: 1 }, $push: { usersDisliked: req.body.userId } })
                .then((sauce) => res.status(200).json({ message: "Un dislike supplémentaire" }))
                .catch(error => res.status(400).json({ error }));
            }
          }).catch(error => res.status(400).json({ error }));
      } else if (req.body.like === 0) { // l'utilisateur enlève son like ou dislike

        // rechercher la sauce ayant pour id req.params.id 
        Sauce.findOne({ _id: req.params.id })
          .then(sauce => {
            // Si l'array usersLiked contient l'id de l'utilisateur
            if (sauce.usersLiked.includes(req.body.userId)) {
              // likes -1 & retrait de l'userId de l'array usersLiked
              Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: -1 }, $pull: { usersLiked: req.body.userId } })
                .then((sauce) => res.status(200).json({ message: "Un like en moins" }))
                .catch(error => res.status(400).json({ error }))
            }
            else if (sauce.usersDisliked.includes(req.body.userId)) {
              // dislikes -1 & retrait de l'userId de l'array usersDisliked
              Sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: -1 }, $pull: { usersDisliked: req.body.userId } })
                .then((sauce) => res.status(200).json({ message: "Un dislike en moins" }))
                .catch(error => res.status(400).json({ error }))
            }
          })
          .catch(error => res.status(400).json({ error }));
      } else { res.status(400).json({ erreur: "Le statut Like doit être égal à 1, -1 ou 0" }); }
    }
  })

};
