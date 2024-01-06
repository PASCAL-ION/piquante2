//ici se trouve les gestionnaires d'evenements pour les requêtes
const Sauce = require('../models/sauces') //on importe le schema mongoose 
const fs = require('fs')

exports.createSauce = (req, res, next) => { 
    const sauceObject = JSON.parse(req.body.sauce) 
    const sauce = new Sauce({ //on créé une nouvelle instance de notre modele Sauce qui se situe dans ./models/sauces.js
      /* title: req.body.title,
      description: req.body.title */
      ...sauceObject, //on utilise ce racourcis, avec l'opérateur spread (...), pour récuperer tous les champs du body directement au lieu de les réécrire un par un comme juste au dessus
      userId: req.auth.userId, 
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    })
    sauce.save() //on enregistre l'instance dans la base de données 
      .then(() => res.status(201).json({message: "objet enregistré"})) //on doit renvoyer une réponse pour éviter l'expiration de la requête
      .catch(error => res.status(400).json({ error }))
}

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ? { // on vérifie qu'il y est un champ file
    ...JSON.parse(req.body.sauce), // Dans ce cas on récupère le corps de la requête
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` //et on reconstruit le nom du fichier : on y remplace le nom du fichier qui est dans le body de la requête par celui qui se situe dans req.file.filename 
  } : { ...req.body }; //si non on récupère directement l'objet dans le corps de la requête

delete sauceObject._userId;// par mesure de sécurité on supprime l'id venant de la requête
Sauce.findOne({_id: req.params.id}) // chercher la sauce pour ensuite en vérifier l'appartenance a l'utilisateur qui cherche a la modifier
    .then((sauce) => {
        if (sauce.userId != req.auth.userId) { // si l'userId de la sauce n'est pas le même que celui qui vient de notre token
            res.status(401).json({ message : 'Not authorized'});
        } else {
          Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id}) // on cherche l'objet et on passe l'objet par lequel il doit etre remplacé et avec l'id de l'url
            .then(() => res.status(200).json({message : 'Objet modifié!'}))
            .catch(error => res.status(401).json({ error }));
        }
    })
    .catch((error) => {
        res.status(400).json({ error });
    });
}

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id})
  .then(sauce => {
      if (sauce.userId != req.auth.userId) {
          res.status(401).json({message: 'Not authorized'});
      } else {
          const filename = sauce.imageUrl.split('/images/')[1];
          fs.unlink(`images/${filename}`, () => {
            Sauce.deleteOne({_id: req.params.id})
                  .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                  .catch(error => res.status(401).json({ error }));
          });
      }
  })
  .catch( error => {
      res.status(500).json({ error });
  });
}

exports.getOneSauce = (req, res, next) => { //a la fin de la route on utilise ":" pour indiquer a express que c'est un parametre dynamique. C'est un id renvoyé par le front
  Sauce.findOne({ _id: req.params.id}) //on peut récuperer l'id avec "req.params.id". Ici avec findOne on retrouve un seul objet dans la base de données. Donc on veut que l'id de l'objet soit le même que l'id dans le parametre de requête 
      .then(s => res.status(200).json(s )) //on retourne donc l'objet s'il existe
      .catch(error => res.status(404).json({ error }));
}

exports.getAllSauces = (req, res, next) => { //ici on gère les requêtes GET. En premier paramètre on a la route (aussi appelée endpoint) que le font doit utiliser pour la requête afin d'avoir la réponse donc la route sera "http://localhost:3000/api/stuff"
    Sauce.find() //on récupère la liste complète des objets dans la base de données
      .then(Sauces => res.status(200).json(Sauces))//on envoie le tableau des produits reçcu depuis la base de données
      .catch(error => res.status(400).json({ error }))
}

exports.userLike = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id})
    .then(object => {
      const usersLiked = object.usersLiked.includes(req.body.userId)
      const usersDisliked = object.usersDisliked.includes(req.body.userId)
      const usersVote = req.body.like

      switch (usersVote) {
        case 1 : 
          if (usersLiked === false) { //si l'utilisateur n'est pas dans le tableau des likes
            object.updateOne(
              {
                $inc: {likes: 1},
                $push: {usersLiked: req.body.userId}
              }
            )
            .then(() => res.status(201).json({ message : "+ 1 like" }))
            .catch((err) => res.status(400).json({ err }))
          }
          break;
        case -1 :
          if (usersDisliked === false){ //si l'utilisateur n'est pas dans le tableau des dislikes
            object.updateOne(
              {
                $inc: {dislikes: 1},
                $push: {usersDisliked: req.body.userId}
              }
            )
            .then(() => res.status(201).json({ message : "- 1 like" }))
            .catch((err) => res.status(400).json({ err }))
          }
          break;
        case 0 :
          if (usersDisliked === true) {
            object.updateOne(
              {
                $inc: {dislikes: -1},
                $pull: {usersDisliked: req.body.userId}
              }
            )
            .then(() => res.status(201).json({ message : "- 1 like" }))
            .catch((err) => res.status(400).json({ err }))
          }
          if (usersLiked === true) {
            object.updateOne(
              {
                $inc: {likes: -1},
                $pull: {usersLiked: req.body.userId}
              }
            )
            .then(() => res.status(201).json({ message : "- 1 like" }))
            .catch((err) => res.status(400).json({ err }))
          }
          break;
      }
    })   
} 
    