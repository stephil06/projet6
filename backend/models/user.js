
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
    , match: /^(([^<>()[]\.,;:s@]+(.[^<>()[]\.,;:s@]+)*)|(.+))@(([[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}])|(([a-zA-Z-0-9]+.)+[a-zA-Z]{2,}))$/
    , required: true, unique: true
  },
  password: { type: String, required: true }
});
userSchema.plugin(uniqueValidator);

// const User = mongoose.model('User', userSchema);
module.exports = mongoose.model('User', userSchema);
