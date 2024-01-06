//Pour une question de maintenabilité on va écrire ici toutes les routes et les fonctions pour géréer les requêtes pour chaque route sont dans ../controllers/sauces
const express = require('express'); //on importe express pour utiliser la methode router
const auth = require('../middleware/auth')
const router = express.Router(); //on utilise la methode router qui est dispo avec express
const multer = require('../middleware/multer-config')

const sauceCtrl = require('../controllers/sauces') //on importe le module "sauces" pour pouvoir utiliser les fonctions qui se trouvent dedans

//ici on définit une route et pour chaque route la fonction qu'on va utiliser pour géréer la requête. Avant d'appeler le gestionnaire de requête on appelle auth
router.post('/', auth, multer, sauceCtrl.createSauce);  
router.put('/:id', auth, multer, sauceCtrl.modifySauce);  
router.delete('/:id', auth,  sauceCtrl.deleteSauce)  
router.get('/:id', auth, sauceCtrl.getOneSauce)  
router.get('/', auth, sauceCtrl.getAllSauces);
router.post('/:id/like', auth, sauceCtrl.userLike)
module.exports = router;