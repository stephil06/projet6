
// -----------------------------------------------------------------------------------------------
// ----- Require ---------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------

const { exit } = require('process');
const Sauce = require('../models/sauces'); // importer le model sauces

const User = require('../models/user'); // importer le model user par rapport à la fonction createSauce()

const fs = require('fs'); // pour supprimer les fichiers du dossier 'backend/images'

// -----------------------------------------------------------------------------------------------
// ----- SAUCES : implémenter les méthodes de notre API -------------------------------------
// -----------------------------------------------------------------------------------------------

/* Retourner un array (tableau) de toutes les sauces stockées en base de données
   Retourner { error } si erreur
*/
exports.getLesSauces = (req, res, next) => {

  Sauce.find()
    // codeHTTP 200 (OK) : "succès de la requête"
    .then(sauces => res.status(200).json(sauces)) // Retourne toutes les sauces
    // codeHTTP404	Not Found	: "Ressource non trouvée"
    .catch(error => res.status(404).json({ error }));
};

/* Retourner la sauce ayant pour identifiant : req.params.id dans la base de données
   Retourner { erreur: "La sauce n'existe pas!" } si identifiant n'existe pas
*/
exports.getLaSauce = (req, res, next) => {
  /* .get(function (req, res) { */
  // fonction Mongoose pour chercher un document par son identifiant
  Sauce.findById(req.params.id, function (err, sauce) {
    if (err || sauce === null)
      // codeHTTP404	Not Found	: "Ressource non trouvée"
      res.status(404).json({ erreur: "La sauce n'existe pas!" });
    else
      // codeHTTP 200 (OK) : "succès de la requête"
      res.status(200).json(sauce);
  });
};

/* Supprimer le fichier correspondant à imageUrl de la sauce passée en argument */
const supprimerFichier = (sauce) => {
  // Récupérer le nom du fichier relatif à la sauce (de la base de données)
  const fichierDB = sauce.imageUrl.split('/images/')[1];
  // console.log("fichierDB: " + fichierDB);

  // Supprimer ledit fichier du dossier '/images'
  fs.unlink(`../backend/images/${fichierDB}`, (error) => {
    if (error) console.log(error);
  });
}

/* Supprimer la sauce ayant pour identifiant : req.params.id 
    - Si l'idSauce n'existe pas (en base de données) : on retourne { erreur: "La sauce n'existe pas!" } 
    - Sinon :
        - Si req.auth.userId != sauce.userId : on retourne { erreur: "Ne peux pas être supprimé par un autre utilisateur !" }
        - Sinon :
            - on supprime le fichier image de ladite sauce (du dossier 'backend/image')
            - on supprime la sauce de la base de données & on retourne { message: 'Sauce supprimée !' }
*/
// fonction Mongoose pour supprimer un document par son identifiant
// Sauce.remove({ _id: req.params.id }, function (err, sauce) { : remove() est deprecated

exports.deleteLaSauce = (req, res, next) => {

  Sauce.findById(req.params.id, function (err, sauce) {
    if (err || sauce === null)
      // codeHTTP404	Not Found	: "Ressource non trouvée"
      res.status(404).json({ erreur: "La sauce n'existe pas!" });
    else {
      if (req.auth.userId != sauce.userId)
        // codeHTTP403 : Forbidden
        res.status(403).json({ erreur: "Ne peux pas être supprimé par un autre utilisateur !" });
      else {
        // console.log("SAUCE" + sauce);
        supprimerFichier(sauce);
        Sauce.deleteOne({ _id: req.params.id }) // On supprime la sauce de la BDD
          // codeHTTP 204 (OK) : "succès de la requête"
          .then(() => res.status(204).json({ message: "Sauce supprimée !" }))
          .catch(error => res.status(400).json({ error }));
      }
    }
  });
};

/* Modifier 1 sauce ayant pour identifiant : req.params.id, avec les données du body
  - Si l'idSauce n'existe pas (en base de données) : on retourne { erreur: "La sauce n'existe pas!" }
  - Sinon :
      - Si req.auth.userId != sauce.userId : on retourne { erreur: "Ne peux pas être modifié par un autre utilisateur !" }
      - Sinon :
          - Si le fichier mentionné dans le body n'est pas renseigné :
              - on opère la modification dans la base de données (avec les données du body) 
                & on retourne { message: "Sauce modifiée (SANS modification de l'image!)" }
          - Sinon :
              - on opère la modification dans la base de données (avec les données du body) 
                & on retourne { message: "Sauce modifiée (SANS modification de l'image!)" }
              - & on supprime l'ancienne image  
*/
exports.updateSauce = (req, res, next) => {

  Sauce.findById(req.params.id, function (err, sauce) {
    if (err || sauce === null)
      // codeHTTP404	Not Found	: "Ressource non trouvée"
      res.status(404).json({ erreur: "La sauce n'existe pas!" });
    else {
      // console.log('sauce.userId:' + sauce.userId + '; ' + 'req.auth.userId:' + req.auth.userId);
      if (req.auth.userId != sauce.userId)
        // codeHTTP403 : Forbidden
        res.status(403).json({ erreur: "Ne peux pas être modifié par un autre utilisateur !" });
      else {
        // console.log("req.file:" + req.file);
        // Si le fichier mentionné dans le body n'est pas renseigné
        if (req.file === undefined) {

          // On met à jour les infos
          Sauce.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id },
            { runValidators: true }) // => définir l' option runValidators à true pour update()
            // car les validateurs de mise à jour sont désactivés par défaut

            // codeHTTP 200 (OK) : "succès de la requête"
            .then(() => res.status(200).json({ message: "Sauce modifiée (SANS modification de l'image!)" }))
            .catch(error => res.status(400).json({ error }));
        }
        else {
          supprimerFichier(sauce);

          // Récupérer le nom du fichier mentionné dans le body
          const fichierBody = req.file.filename; // console.log("fichierBody: " + fichierBody);

          try {
            // Transformer le JSON (req.body.sauce) en objet JS
            const objetSauce = JSON.parse(req.body.sauce);

            const objetSauceAvecImage = {
              ...objetSauce,
              imageUrl: `${req.protocol}://${req.get('host')}/images/${fichierBody}`
            }
            // console.log('sauce:' + objetSauceAvecImage.imageUrl);

            // On met à jour les infos
            Sauce.updateOne({ _id: req.params.id }, { ...objetSauceAvecImage, _id: req.params.id }
              , { runValidators: true }) // => définir l' option runValidators à true pour update()
              // car les validateurs de mise à jour sont désactivés par défaut

              // Sauce.updateOne({ _id: req.params.id }, { name: "toto", _id: req.params.id })
              // codeHTTP 200 (OK) : "succès de la requête"
              .then(() => res.status(200).json({ message: "Sauce modifiée (AVEC modification de l'image!)" }))
              .catch(error => res.status(400).json({ error }));

          } catch (error) {
            res.status(400).json({ erreur: "Le body est mal écrit !" });
          }
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
  // console.log('Fichier createSauce:' + req.file);

  // Si le fichier mentionné dans le body n'est pas renseigné
  if (req.file === undefined) {
    res.status(400).json({ erreur: "Le fichier du body n'a pas été renseigné !" });
  }
  else {
    // Récupérer le nom du fichier mentionné dans le body
    const nomFichier = req.file.filename; // console.log('Fichier :' + nomFichier);
    if (!nomFichier.endsWith('jpg') && !nomFichier.endsWith('jpeg') && !nomFichier.endsWith('png'))
      res.status(400).json({ erreur: "Le fichier du body doit avoir pour extension : jpg, jpeg, ou png !" });

    else {
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
        sauce.save()
        // codeHTTP 201 (OK) Created : "Requête traitée avec succès et création d’un document."
        .then((sauce) => res.status(201).json({ message: "La sauce a été ajoutée en base de données" }))
        .catch(error => res.status(400).json({ erreur: error }));

      } catch (error) {
        res.status(400).json({ erreur: "Le body.sauce est mal écrit !" });
      }
    }// else
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
// ATTENTION : Entorse aux Spécifications de l'API : on supprime du body "body.userId" pour le capturer via req.auth.userId
// Pour améliorer la sécurité

/* Liker (si like =1) ou Disliker (si like =-1) ou annuler le like/dislike (si like = 0) 
  une sauce (ayant pour id req.params.id) par l'utilisateur (ayant pour id req.auth.userId)
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
    // rechercher (en base de données) l'utilisateur d'identifiant req.auth.userId
    User.findById(req.auth.userId, function (err, user) {
      if (err || user === null) {
        // codeHTTP404	Not Found	: "Ressource non trouvée"
        res.status(404).json({ erreur: "L'utilisateur n'existe pas !" });
      }
      else {
        // rechercher (en base de données) la sauce ayant pour id req.params.id
        Sauce.findById(req.params.id, function (err, sauce) {
          if (err || sauce === null) {
            // codeHTTP404	Not Found	: "Ressource non trouvée"
            res.status(404).json({ erreur: "La sauce n'existe pas !" });
          }
          else {
            // console.log('User:' + user);
            // console.log('Sauce:' + sauce);

            if (req.body.like === 1 || req.body.like === -1)
              // interdire de liker ou de disliker la même sauce plusieurs fois par un même utilisateur
              if (sauce.usersLiked.includes(req.auth.userId) || sauce.usersDisliked.includes(req.auth.userId))
                res.status(400).json({ erreur: "Interdit de liker ou de disliker la même sauce plusieurs fois par un même utilisateur" });
              else
                if (req.body.like === 1) {
                  // likes +1 & ajout de l'userId dans l'array usersLiked
                  Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: 1 }, $push: { usersLiked: req.auth.userId } }
                    , { runValidators: true }) // => définir l' option runValidators à true pour update()
                    .then((sauce) => res.status(200).json({ message: "Un like en plus" }))
                    .catch(error => res.status(400).json({ error }));
                }
                else {
                  // dislikes +1 & ajout de l'userId dans l'array usersDisliked  
                  Sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: 1 }, $push: { usersDisliked: req.auth.userId } }
                    , { runValidators: true }) // => définir l' option runValidators à true pour update()
                    .then((sauce) => res.status(200).json({ message: "Un dislike en plus" }))
                    .catch(error => res.status(400).json({ error }));
                }
            else {
              // req.body.like = 0 : l'utilisateur enlève son like ou dislike
              // Si l'array usersLiked contient l'id de l'utilisateur
              if (sauce.usersLiked.includes(req.auth.userId)) {
                // likes -1 & retrait de l'userId de l'array usersLiked
                Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: -1 }, $pull: { usersLiked: req.auth.userId } }
                  , { runValidators: true }) // => définir l' option runValidators à true pour update()
                  .then((sauce) => res.status(200).json({ message: "Un like en moins" }))
                  .catch(error => res.status(400).json({ error }))
              }
              else if (sauce.usersDisliked.includes(req.auth.userId)) {
                // dislikes -1 & retrait de l'userId de l'array usersDisliked
                Sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: -1 }, $pull: { usersDisliked: req.auth.userId } }
                  , { runValidators: true }) // => définir l' option runValidators à true pour update()
                  // , usersDisliked: []})
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
