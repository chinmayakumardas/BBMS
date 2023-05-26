const path = require('path');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const flash = require('connect-flash');
const csrf = require('csurf');
const methodOverride = require('method-override');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const socketio = require('socket.io');

const errorController = require('./controllers/error');
const mainRoutes = require('./routes/main');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const User = require('./models/user');

const PORT = process.env.PORT || 3000;
const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${
    process.env.MONGO_PASSWORD
    }@bloodbankmanagementsystem-5yuou.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`;


const app = express();
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});
const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(helmet());
app.use(compression());

app.use(methodOverride('_method'));
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store // store sessions in MongoDB with connect-mongodb-session
}));
app.use(flash());

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    next();
});

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            if (!user) {
                return next();
            }
            // set the user key in the request object to the model user we get from mongoose
            req.user = user;
            console.log(`Current Session User Email is: ${user.email} + ${user._id}`);
            next();
        })
        .catch(err => {
            next(new Error(err));
        });
});
app.use(csrfProtection);
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});



app.use(mainRoutes);
app.use(userRoutes);
app.use(adminRoutes);
app.use(authRoutes);

const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'access.log'),
    { flags: 'a' }
);
app.use(morgan('combined', { stream: accessLogStream }));

app.get('/500', errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
    res.status(500).render('500', {
        pageTitle: 'Error',
        isAuthenticated: req.session.isLoggedIn
    });
});

mongoose
    .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true }).then(result => {
        app.listen(process.env.PORT || 3000, () => {
            console.log(`App listening on port ${PORT}`);
        });
    }).catch(err => {
        console.log(err);
    });

// const server = app.listen(PORT, process.env.IP, () => {
//     console.log(`App listening on port ${PORT}.`);
// });

// Connect to socket.io
// const io = socketio(server);
// io.on('connection', (socket) => {
//     console.log('Connected');
//     io.on('disconnect', () => {
//         console.log('Disconnected');
//     })
// });
