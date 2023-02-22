
// -----------------------------------------------------------------------------------------------
// ----- Require ---------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------

// La constante mongoose nous permettra d'utiliser les fonctions du module/framework MongoDB "mongoose"
// precondition : l'installer (npm install mongoose --save)
const mongoose = require('mongoose'); mongoose.set('strictQuery', true);

// pour gérer l'unicité
const uniqueValidator = require('mongoose-unique-validator'); // precondition : npm install mongoose-unique-validator --force

// -----------------------------------------------------------------------------------------------
// ----- Couche Base de Données ------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------

// Pour modéliser les données, le framework mongoose utilise des "schémas" ; on crée donc un modèle de données pour les USER & pour les SAUCE :

/* USER :
  ● email : String — adresse e-mail de l'utilisateur [unique]
  ● password : String — mot de passe de l'utilisateur haché
*/
const userSchema = mongoose.Schema({
  email: {
    type: String
    , match: /^(([^<>()[]\.,;:s@]+(.[^<>()[]\.,;:s@]+)*)|(.+))@(([[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}])|(([a-z-0-9]+.)+[a-z]{2,}))$/
    , required: true, unique: true
    , lowercase: true // enregistrer l'email en minuscules
    , minlength: [8,"L'email doit avoir au minimum 8 caractères"]
    , maxlength: [40, "L'email doit avoir au maximum 40 caractères"]
  },
  password: {
    type: String
    , required: true
  }
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
