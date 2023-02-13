
const multer = require('multer'); // precondition: npm install multer

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

// indiquer à multer où enregistrer les fichiers entrants
const storage = multer.diskStorage({
    // la fonction destination indique à multer d'enregistrer les fichiers dans le dossier images
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    // la fonction filename indique à multer d'utiliser le nom d'origine, de remplacer les espaces par des underscores et d'ajouter un timestamp Date.now() comme nom de fichier
    filename: (req, file, callback) => {

        const extension = MIME_TYPES[file.mimetype]; // déterminer l'extension du fichier

        let nomFichier = file.originalname.replace('.' + extension, ''); // enlever le .extension
        nomFichier = nomFichier.split(' ').join('_'); // remplacer les espaces par des underscores
        nomFichier = nomFichier + Date.now() + '.' + extension;
        callback(null, nomFichier);
    }
});

// on exporte l'élément multer, en précisant que l'on autorise uniquement les téléchargements de fichiers image
module.exports = multer({ storage: storage }).single('image');
