const express = require("express") //installe express
const app = express()
const mongoose = require('mongoose') //ce module va nous permettre d'intéragir plus facilement avec la bd depuis notre app express
const saucesRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');
const path = require('path')
const cors = require('cors')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
 
const MY_DB_ID = process.env.DB_ID;
const MY_DB_PWD = process.env.DB_PWD;
const MY_CLUSTER_ADDRESS = process.env.CLUSTER_ADDRESS

app.use(cors()) 

//on connecte ici notre API a mongoDb Atlas
mongoose.connect(`mongodb+srv://${MY_DB_ID}:${MY_DB_PWD}@${MY_CLUSTER_ADDRESS}`,
{ useNewUrlParser: true, // pour éviter des erreurs de dépréciations
  useUnifiedTopology: true }) // pour éviter des erreurs de dépréciations
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch((err) => console.log('Connexion à MongoDB échouée !' + err));

app.use(express.json()); //middleware express, analyse les données JSON dans le corps de la requête et les ajoute dans req.body
 
app.use('/api/sauces', saucesRoutes); //on passe en premier argument la route générale pour les requêtes concernant les sauces
app.use('/api/auth', userRoutes); //route générale pour les requêtes concernant l'authentification
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/', console.log("ça fonctionne")); //route générale pour les requêtes concernant l'authentification

module.exports = app
