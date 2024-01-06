const http = require('http'); //module qui contient la fonction de création du serveur
const app = require("./app") // import de l'application server qui va écouter les reqêtes 
//createServer est une fonction qui vient du module http
const server = http.createServer(app) //l'application qui est crée dans app.js et qu'on importe ici est une fonction qui va recevoir les requêtes

const port = process.env.PORT || 3000;

app.set('port', port) //on établi le port sur lequel l'app doit ecouter

const errorHandler = error => {
    if (error.syscall !== "listen") { 
        throw error
    }
    const address = server.address()
    const bind = typeof address === "string" ? "pipe " + address : "port: " + port
    switch (error.code){
        case "EACCES":
            console.error(bind + " requires elevated priileges.")
            process.exit(1)
            break
        case "EADDRINUSE":
            console.error(bind + " already in use.")
            process.exit(1)
            break
        default:
            throw error
    }
} 


server.on('error', errorHandler);
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
});


server.listen(port) //on lie le serveur a une adresse réseau après l'avoir créé pour avoir une "porte" vers le serveur.
