const mongoose = require("mongoose")

const sauceSchema = mongoose.Schema({ // on crée un schema de données qui contient les champs souhaités pour chaque produit (pas besoin de champs pour l'id car il est généré par mongoose)
    //on crée un objet ici et pour chaque clé on indique le type de données de la valeur
    userId: { type: String, required: true },
    name: { type: String, required: true },
    manufacturer: {type: String, required: true},
    description: { type: String, required: true },
    mainPepper: {type: String, required: true},
    imageUrl: { type: String, required: true },
    heat: { type: Number, required: true },
    likes: { type: Number, default : 0 },
    dislikes: { type: Number , default : 0},   
    usersLiked: { type: [String]},
    usersDisliked: { type: [String]}
})

module.exports = mongoose.model('Sauce', sauceSchema) //on exporte le schema en tant que modele mongoose sous le nom de Sauce