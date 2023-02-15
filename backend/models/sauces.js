
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

// author: { type: Schema.Types.ObjectId, ref: 'Person' },
const sauceSchema = mongoose.Schema({
  //  userId: { type: String, required: true, immutable: true}, 

  userId: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User' // faire référence au path 'user._id' (du schéma 'User')
    , required: true, immutable: true // rendre userId immutable i.e interdire la modification de sa valeur
  },
  name: { type: String, required: true, trim: true },
  manufacturer: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  mainPepper: { type: String, required: true, trim: true },
  // imageUrl: { type: String, required: true },
  imageUrl: { type: String, required: true },

  heat: { type: Number, min: 1, max: 10, required: true },
  likes: { type: Number, min: 0, required: true, default: 0  },

  /* likes: { type: Number, min: 0, required: true, default: 0
    , validate: (value)=>
    {
        console.log('ZAZA');
        if(value != this.usersLiked.length)
        {
            throw new Error("le path 'likes' doit correspondre au nombre d'éléments de 'usersLiked'")
        }
    }
  },*/

  dislikes: { type: Number, min: 0, required: true, default: 0 },
  // usersLiked: [{ type: String, required: true, default: [] }],
  // usersLiked: [{ type: String, required: true, default: [] }],
  usersLiked: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'User'
    , required: true, default: []
  }],
  // usersDisliked: [{ type: String, required: true, default: [] }],
  usersDisliked: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'User'
    , required: true, default: []
  }]
});

// Pour 'imageUrl' : interdire de se terminer par autre chose que .jpg, ou .jpeg ou .png  
sauceSchema.path('imageUrl').validate(function (v) {
  if (v.match('.png$') === null && v.match('.jpg$') === null && v.match('.jpeg$') === null)
    throw new Error('Imageurl doit se terminer par une extension .jpg ou .jpeg ou .png');
  return true;
}, 'imageUrl `{VALUE}` is not valid');

/*
sauceSchema.post('validate', function (next) {
  console.log("pre validate called");
  this.set("likes", 2); // this.usersLiked.length;
  next();
});
*/

/*
var schema = new mongoose.Schema({
  name: String,
  upvoteCount: Number,
  upvotes: [{}]
});

schema.pre('validate', function (next) {
  this.upvoteCount = this.upvotes.length
  next();
}); */



// const Sauce = mongoose.model('Sauce', sauceSchema);

module.exports = mongoose.model('Sauce', sauceSchema);
