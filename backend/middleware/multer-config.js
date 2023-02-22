const multer = require('multer'); // precondition: npm install multer

/* Retourne l'extension du nom du fichier passé en argument */
const getExtension = (nomFichier) => {
    return nomFichier.split(".").pop();
    // split() divise une chaîne en un tableau de chaînes
    // pop() supprime le dernier élément d’un tableau et le renvoie
}

// indiquer à multer où enregistrer les fichiers entrants
const storage = multer.diskStorage({
    // la fonction destination indique à multer d'enregistrer les fichiers dans le dossier 'images'
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    // la fonction filename indique à multer comment nommer le nom du fichier (qui sera uploadé dans le dossier 'images') :
    // i.e. le nom d'origine du fichier, 
    // en remplaçant les espaces par des underscores & en ajoutant un timestamp Date.now() avant l'extension du fichier
    filename: (req, file, callback) => {

        // capturer le nom du fichier de départ
        let nomFichier = file.originalname;

        // capturer l'extension du fichier
        const extension = getExtension(nomFichier);

        nomFichier = nomFichier.replace('.' + extension, ''); // enlever le .extension
        nomFichier = nomFichier.split(' ').join('_'); // remplacer les espaces par des underscores
        nomFichier = nomFichier + Date.now() + '.' + extension;

        if (extension !== 'png' && extension !== 'jpg' && extension !== 'jpeg') {
           return callback(
            new Error("Seuls les fichiers images sont autorisés !").code = "Seuls les fichiers images sont autorisés");
        }
        else
            callback(null, nomFichier);
        
    }

});

// on exporte l'élément multer, en précisant que l'on autorise uniquement les téléchargements de fichiers image
module.exports = multer({ storage: storage }).single('image');
