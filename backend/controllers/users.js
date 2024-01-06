const User = require('../models/users')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const MY_SECRET_TOKEN = process.env.SECRET_TOKEN

exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            })
            user.save()
            .then(() => res.status(201).json({ message: 'Utiliateur créé'}))
            .catch(error => res.status(400).json({ error }))
        })
        .catch(error => res.status(500).json({ error }))
};

/* exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            console.log(user);
            if (!user) {
                return res.status(401).json({ message: 'Identifiant ou mdp incorrect'});
            }
            bcrypt.compare(req.body.password, user.password)
                    .then(valid => {
                        if (!valid) {
                            return res.status(401).json({ message: 'Identifiant ou mdp incorrect' });
                        }
                        res.status(200).json({
                            userId: user._id,
                            token: jwt.sign(
                                { userId: user._id },
                                'RANDOM_TOKEN_SECRET',
                                { expiresIn: '24h' }
                            )
                        });
                    })
                    .catch(error => res.status(500).json({ error }));
            
        })
        .catch(error => res.status(500).json({ error }));
 }; */

 let tentatives = 0; //initialisation du compteur
 const maxtentatives = 5; // nombre max de tentatives
 const dureeDeBlockage = 15 * 60 * 1000; // 15 minutes in milliseconds
 let debutDuBlockage = 0;
 
 exports.login = (req, res, next) => {
     //si le nombre de tentatives a été atteint et que la durée du blockage n'est pas terminée
     if (tentatives >= maxtentatives && Date.now() - debutDuBlockage < dureeDeBlockage) { 
         let remainingTime = dureeDeBlockage - (Date.now() - debutDuBlockage);
         return res.status(401).json({ message: `Too many login tentatives. Please try again in ${Math.round(remainingTime / 1000)} seconds.` });
     }
     User.findOne({ email: req.body.email })
         .then(user => {
             console.log(user);
             if (!user) {
                 tentatives++; // incrementer le compteur de tentatives
                 if (tentatives === maxtentatives) {
                     debutDuBlockage = Date.now();
                 }
                 return res.status(401).json({ message: 'Identifiant ou mdp incorrect'});
             }
             bcrypt.compare(req.body.password, user.password) //compare le mdp saisi par l'utilisateur et celui haché et stocké dans la base de données
                     .then(valid => {
                         if (!valid) {
                             tentatives++; // increment tentatives counter
                             if (tentatives === maxtentatives) {
                                 debutDuBlockage = Date.now();
                             }
                             return res.status(401).json({ message: 'Identifiant ou mdp incorrect' });
                         }
                         // reset le compteur de tentatives et la variable debutDuBlockage lorsque la connexion et autorisée
                         tentatives = 0;
                         debutDuBlockage = 0;
                         res.status(200).json({
                             userId: user._id,
                             token: jwt.sign(
                                 { userId: user._id },
                                 MY_SECRET_TOKEN,
                                 { expiresIn: '24h' }
                             )
                         });
                     })
                     .catch(error => res.status(500).json({ error }));
             
         })
         .catch(error => res.status(500).json({ error }));
  };