
// -----------------------------------------------------------------------------------------------
// ----- Require ---------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------

// La constante mongoose nous permettra d'utiliser les fonctions du module/framework MongoDB "mongoose"
// precondition : l'installer (npm install mongoose --save)
const mongoose = require('mongoose'); mongoose.set('strictQuery', true);

// -----------------------------------------------------------------------------------------------
// ----- Couche Base de Données ------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------

// Pour modéliser les données, le framework mongoose utilise des "schémas" ; on crée donc un modèle de données pour les USER & pour les SAUCE :

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

// const Sauce = mongoose.model('Sauce', sauceSchema);

module.exports = mongoose.model('Sauce', sauceSchema);
