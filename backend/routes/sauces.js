const express = require("express");
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config'); // pour gérer les fichiers images


const sauceCtrl = require("../controllers/sauces");

// appliquer le middleware "auth" à nos routes
// dans Postman: ajouter "Authorization" type "Bearer token" : le token généré via (Postman POST) http://localhost:3000/api/auth/login

router.get('/', auth, sauceCtrl.getLesSauces); // Lire toutes les sauces

router.get('/:id', auth, sauceCtrl.getLaSauce); // Lire les propriétés d'une sauce ayant pour identifiant :id
router.delete('/:id', auth, sauceCtrl.deleteLaSauce); // Supprimer la sauce ayant pour identifiant :id
router.put('/:id', auth, sauceCtrl.updateSauce); // Modifier la sauce ayant pour identifiant :id

router.post('/', auth, multer, sauceCtrl.createSauce); // Créer une nouvelle sauce

router.post('/:id/like', auth, sauceCtrl.likerOuDislikerSauce); // liker ou disliker la sauce ayant pour identifiant :id

module.exports = router;
