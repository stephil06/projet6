/* const express = require('express'); const app = express();

app.listen(8080, () => { console.log("Serveur à l'écoute"); });
*/

const express = require('express'); const app = express();

// app.get('/parkings', (req, res) => { res.send("Liste des parkings"); });
// app.listen(8080, () => { console.log("Serveur à l'écoute"); });


// const express = require('express'); const app = express(); 
const parkings = require('./parkings.json');

// Middleware 
app.use(express.json());

app.get('/parkings', (req, res) => { res.status(200).json(parkings); });
// app.listen(8080, () => { console.log("Serveur à l'écoute"); });



// const express = require('express')const app = express()const parkings = require('./parkings.json')app.get('/parkings', (req, res) => { res.status(200).json(parkings) })


app.get('/parkings/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const parking = parkings.find(parking => parking.id === id);
  res.status(200).json(parking);
});

app.post('/parkings', (req, res) => { parkings.push(req.body); res.status(200).json(parkings); });

app.put('/parkings/:id', (req, res) => {
  const id = parseInt(req.params.id);
  let parking = parkings.find(parking => parking.id === id);
  parking.name = req.body.name; parking.city = req.body.city; parking.type = req.body.type;
  res.status(200).json(parking);
});

app.delete('/parkings/:id', (req, res) => {
  const id = parseInt(req.params.id); 
  let parking = parkings.find(parking => parking.id === id);
  parkings.splice(parkings.indexOf(parking)); // , 1);
  res.status(200).json(parkings);
});

app.listen(8080, () => { console.log("Serveur à l'écoute") })



// const express = require('express'); const app = express(); const parkings = require('./parkings.json');
// Middleware app.use(express.json()); // app.get('/parkings', (req,res) => {    res.status(200).json(parkings)}); app.get('/parkings/:id', (req,res) => {    const id = parseInt(req.params.id)    const parking = parkings.find(parking => parking.id === id)    res.status(200).json(parking)})app.listen(8080, () => {    console.log("Serveur à l'écoute")})





/* Pour tester :
    1. Dans le dossier backend : node server
    2. Dans 1 navigateur (eg. Firefox) : http://localhost:3000/
    OU Dans Postman : http://localhost:3000/
*/

// importez le package ou Module HTTP natif de Node
// NB: require()  nous permet d'omettre l'extension  .js



/*
const http = require('http');

// créer un serveur Node via la methode createServer() du package http
const server = http.createServer( (req, res) => {
    res.end('Voilà la réponse du serveur !');
});

// configurer le serveur pour qu'il écoute le port par défaut OU port 3000
server.listen(process.env.PORT || 3000); // port par défaut OU port 3000
*/


/*

const http = require('http');
const app = require('./app');

app.set('port', process.env.PORT || 3000);
const server = http.createServer(app);

server.listen(process.env.PORT || 3000);
*/














/*
const http = require('http');
const app = require('./app');

const normalizePort = val => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

const errorHandler = error => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use.');
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const server = http.createServer(app);

server.on('error', errorHandler);
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
});

server.listen(port);

*/




