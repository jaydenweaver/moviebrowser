require('dotenv').config();

const express = require('express');
const app = express();

const https = require('https');
const fs = require('fs');
const credentials = {
  key: fs.readFileSync('selfsigned.key','utf8'),
  cert: fs.readFileSync('selfsigned.crt','utf8'),
}

const uiSwagger = require('swagger-ui-express');
const swaggerDocs = require('./api.json');

const movieRoutes = require('./routes/movies');
const peopleRoutes = require('./routes/people');
const userRoutes = require('./routes/user');

const errors = require('./utils/errors');

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

app.use('/movies', movieRoutes);
app.use('/user', userRoutes);
app.use('/people', peopleRoutes);
app.use('/', uiSwagger.serve);
app.get('/', uiSwagger.setup(swaggerDocs));

app.use((req, res, next) => {
  return errors.notFoundError(res);
});

const PORT = 3000;
const httpsServer = https.createServer(credentials, app);

httpsServer.listen(PORT, () => {
  console.log(`HTTPS server running at https://localhost:${PORT}`);
});