import path from 'path'
import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import session from 'express-session';
import sequelize from './modules/sequelize'
import redisClient from './modules/redisClient'

var redisStore = require('connect-redis')(session);

const app = express();

app.use(cookieParser());
app.use(session({
    secret: 'keyboard cat',
    store: new redisStore({
        client: redisClient,
        ttl: 20000
    }),
    resave: false,
    saveUninitialized: false
}));

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist'));

app.use(require('./routes/kupbuk-views'));
app.use('/auth', require('./routes/auth'));
app.use(require('./routes/offer'));
app.use(require('./routes/user'));

sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

var server = app.listen(3000, () =>{
    console.log("server running on port 3000")
});

/*import modelsDbSynchronizerFunc from './modules/models-db-synchronizer';

modelsDbSynchronizerFunc();*/
