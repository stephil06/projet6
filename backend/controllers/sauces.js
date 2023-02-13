
// -----------------------------------------------------------------------------------------------
// ----- Require ---------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------

const { exit } = require('process');
const Sauce = require('../models/sauces'); // importer le model sauces

const User = require('../models/user'); // importer le model user par rapport à la fonction createSauce()

// -----------------------------------------------------------------------------------------------
// ----- SAUCES : implémenter les méthodes de notre API -------------------------------------
// -----------------------------------------------------------------------------------------------

/* Retourner un array (tableau) de toutes les sauces stockées en base de données
   Retourner { error } si erreur
*/
exports.getLesSauces = (req, res, next) => {
  Sauce.find().then(sauces => res.status(200).json(sauces)) // Retourne toutes les sauces
    .catch(error => res.status(404).json({ error }));
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

/* Retourner la sauce ayant pour identifiant : req.params.id dans la base de données
   Retourner { erreur: "La sauce n'existe pas!" } si identifiant n'existe pas
*/
exports.getLaSauce = (req, res, next) => {
  /* .get(function (req, res) { */
  // fonction Mongoose pour chercher un document par son identifiant
  Sauce.findById(req.params.id, function (err, sauce) {
    if (err || sauce === null)
      res.status(404).json({ erreur: "La sauce n'existe pas!" });
    else
      res.status(200).json(sauce);
  });
};

/* Supprimer la sauce ayant pour identifiant : req.params.id 
    - Si l'idSauce n'existe pas (en base de données) : on retourne { erreur: "La sauce n'existe pas!" } 
    - Sinon : on supprime la sauce de la base de données & on retourne { message: 'Sauce supprimée !' }
*/
// fonction Mongoose pour supprimer un document par son identifiant
// Sauce.remove({ _id: req.params.id }, function (err, sauce) { : remove() est deprecated

exports.deleteLaSauce = (req, res, next) => {

  Sauce.findById(req.params.id, function (err, sauce) {
    if (err || sauce === null)
      res.status(400).json({ erreur: "La sauce n'existe pas!" });
    else
      Sauce.deleteOne({ _id: req.params.id }) // On supprime la sauce de la BDD
        .then(() => res.status(204).json({ message: 'Sauce supprimée !' }))
        .catch((error) => res.status(404).json({ error: error }));
  });
};

/* Modifier 1 sauce ayant pour identifiant : req.params.id, avec les données du body
  - Si l'idSauce n'existe pas (en base de données) : on retourne { erreur: "La sauce n'existe pas!" }
  - Sinon, on opère la modification dans la base de données (avec les données du body) & on retourne { message: 'Sauce modifiée!' }
*/
exports.updateSauce = (req, res, next) => {


  Sauce.findById(req.params.id, function (err, sauce) {
    if (err || sauce === null)
      res.status(400).json({ erreur: "La sauce n'existe pas!" });
    else {

      // Si le fichier mentionné dans le body n'est pas renseigné
      if (req.file === undefined) {

        /*
        try {
          console.log("req.body:" + req.body);
        }
        catch (error) {
          res.status(400).json({ erreur: "Le body est mal écrit !" });
        }*/

        // console.log("req.body:" + req.body.manufacturer);

        // On met à jour les infos
        // Sauce.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
        // Sauce.updateOne({ _id: req.params.id }, { name: "toto", _id: req.params.id })
        Sauce.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id },
          { runValidators: true }) // => définir l' option runValidators à true pour update()
        // car les validateurs de mise à jour sont désactivés par défaut
          .then(() => res.status(200).json({ message: "Sauce modifiée (SANS modification de l'image!)" }))
          .catch(error => res.status(400).json({ error }));
      }
      else {
        // Récupérer le nom du fichier mentionné dans le body
        const nomFichier = req.file.filename;

        try {
          // Transformer le JSON (req.body.sauce) en objet JS
          const objetSauce = JSON.parse(req.body.sauce);

          const objetSauceAvecImage = {
            ...objetSauce,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${nomFichier}`
          }
          // console.log('sauce:' + objetSauceAvecImage.imageUrl);

          // On met à jour les infos
          Sauce.updateOne({ _id: req.params.id }, { ...objetSauceAvecImage, _id: req.params.id }
            , { runValidators: true }) // => définir l' option runValidators à true pour update()
            // car les validateurs de mise à jour sont désactivés par défaut

            // Sauce.updateOne({ _id: req.params.id }, { name: "toto", _id: req.params.id })
            .then(() => res.status(200).json({ message: "Sauce modifiée (AVEC modification de l'image!)" }))
            .catch(error => res.status(400).json({ error }));

        } catch (error) {
          res.status(400).json({ erreur: "Le body est mal écrit !" });
        }

      }
    }
  });

};


/* - S'il n'y a pas d'erreur : 
      - Créer 1 sauce avec les données du body et enregistre l'objet sauce dans la base de données
      - Retourne { message: "La sauce a été ajoutée en base de données" }
    - Sinon : retourne un message d'erreur    
*/
exports.createSauce = (req, res, next) => {

  // console.log('body:' + req.body.sauce);

  // Si le fichier mentionné dans le body n'est pas renseigné
  if (req.file === undefined) {
    res.status(400).json({ erreur: "Le fichier du body n'a pas été renseigné !" });
  }
  else {
    // Récupérer le nom du fichier mentionné dans le body
    const nomFichier = req.file.filename;
    console.log('Fichier :' + nomFichier);

    try {
      // Transformer le JSON (req.body.sauce) en objet JS
      const objetSauce = JSON.parse(req.body.sauce);

      // Créer un objet sauce
      const sauce = new Sauce({
        ...objetSauce // copier les éléments de req.body.sauce
        // , imageUrl: `${req.protocol}://${req.get('host')}/images/${nomFichier}` // URL de l'image uploadée
      });

      // Renseigner les autres propriétés de l'objet sauce
      sauce.userId = req.auth.userId; // renseigner le userId
      sauce.imageUrl = `${req.protocol}://${req.get('host')}/images/${nomFichier}`; // renseigner l'imageUrl

      // Stocker l'objet sauce en base
      sauce.save(function (err) {
        if (err) {
          res.status(400).json({ erreur: err });
        }
        res.status(201).json({ message: "La sauce a été ajoutée en base de données" });
      })

    } catch (error) {
      res.status(400).json({ erreur: "Le body.sauce est mal écrit !" });
    }
  }
};




/* Via l'outil Postman :
Méthode POST - Body raw JSON
{
 "userId": "63ce586c4a3f0a9d5a1de02d",
 "like": -1
 }
puis SEND
*/
/* Liker (si like =1) ou Disliker (si like =-1) ou annuler le like/dislike (si like = 0) 
  une sauce (ayant pour id req.params.id) par l'utilisateur (ayant pour id req.body.userId)
 - Si le userId n'existe pas : { erreur: "L'utilisateur n'existe pas !" }
 - Si le sauceId n'existe pas : { erreur: "La sauce n'existe pas !" }
 - Sinon :
    Si userId est dans l'array usersLiked ou l'array usersDisliked : { erreur: "Interdit de liker ou de disliker la même sauce plusieurs fois par un même utilisateur" }
    Sinon :
      - Si like = 1 : likes +1 & ajout de l'userId dans l'array usersLiked
      - Si like = -1: dislikes +1 & ajout de l'userId dans l'array usersDisliked
      - Si like = 0:
          Si l'userId est dans l'array usersLiked
            - likes -1 & retrait de l'userId de l'array usersLiked
          Si l'userId est dans l'array usersLDisliked  
            - dislikes -1 & retrait de l'userId de l'array usersDisliked
          Sinon :
            - { erreur: "Impossible d'annuler le like ou dislike (car il n'y a pas eu de like ou dislike par cet utilisateur pour cette sauce)" }   
*/
exports.likerOuDislikerSauce = (req, res, next) => {

  if (req.body.like != 1 && req.body.like != -1 && req.body.like != 0)
    res.status(400).json({ erreur: "Le statut Like doit être égal à 1, -1 ou 0" });
  else {
    // rechercher (en base de données) l'utilisateur d'identifiant req.body.userId
    User.findById(req.body.userId, function (err, user) {
      if (err || user === null) {
        res.status(400).json({ erreur: "L'utilisateur n'existe pas !" });
      }
      else {
        // rechercher (en base de données) la sauce ayant pour id req.params.id
        Sauce.findById(req.params.id, function (err, sauce) {
          if (err || sauce === null) {
            res.status(400).json({ erreur: "La sauce n'existe pas !" });
          }
          else {
            // console.log('User:' + user);
            // console.log('Sauce:' + sauce);

            if (req.body.like === 1 || req.body.like === -1)
              // interdire de liker ou de disliker la même sauce plusieurs fois par un même utilisateur
              if (sauce.usersLiked.includes(req.body.userId) || sauce.usersDisliked.includes(req.body.userId))
                res.status(400).json({ erreur: "Interdit de liker ou de disliker la même sauce plusieurs fois par un même utilisateur" });
              else
                if (req.body.like === 1) {
                  // likes +1 & ajout de l'userId dans l'array usersLiked
                  Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: 1 }, $push: { usersLiked: req.body.userId } })
                    .then((sauce) => res.status(200).json({ message: "Un like en plus" }))
                    .catch(error => res.status(400).json({ error }));
                }
                else {
                  // dislikes +1 & ajout de l'userId dans l'array usersDisliked  
                  Sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: 1 }, $push: { usersDisliked: req.body.userId } })
                    .then((sauce) => res.status(200).json({ message: "Un dislike en plus" }))
                    .catch(error => res.status(400).json({ error }));
                }
            else {
              // req.body.like = 0 : l'utilisateur enlève son like ou dislike
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
              else {
                res.status(400).json({ erreur: "Impossible d'annuler le like ou dislike (car il n'y a pas eu de like ou dislike par cet utilisateur pour cette sauce)" });
              }
            }

          }
        });

      }
    });
  }
};
