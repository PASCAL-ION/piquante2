const jwt = require('jsonwebtoken');

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const MY_SECRET_TOKEN = process.env.SECRET_TOKEN
 
module.exports = (req, res, next) => {
   try {
       const token = req.headers.authorization.split(' ')[1]; //recuperation du token envoyé par le front
       const decodedToken = jwt.verify(token, MY_SECRET_TOKEN); // on decode le token avec la clef secrète
       const userId = decodedToken.userId; // on rècupère l'userId dans le token
       req.auth = { //on ajoute l'userId a  l'objet req qui, lui, sera transmis aux routes
           userId: userId
       };
	next();
   } catch(error) {
       res.status(401).json({ error });
   }
};