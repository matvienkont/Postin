const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const Handlebars = require('handlebars');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

const app = express();

//Load routes
const posts = require('./routes/posts');
const users = require('./routes/users');

//Map global promise - get rid of deprecation message
mongoose.Promise = global.Promise;

//Handlebars Middleware
app.engine(
	'handlebars',
	exphbs({
		handlebars: allowInsecurePrototypeAccess(Handlebars)
	})
);
app.set('view engine', 'handlebars');

//Middleware for PUT || DELETE methods
app.use(methodOverride('_method'));

//Use static files
app.use(express.static(path.join(__dirname, '/public')));

//Body Parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Express session middleware
app.use(
	session({
		secret: 'secret',
		resave: true,
		saveUninitialized: true,
	})
);
	
//Passport middleware to serialize session (assign and retrieve identification)
app.use(passport.initialize());
app.use(passport.session());

//Flash middleware
app.use(flash());

// Create global variables for flash messages
app.use((req, res, next) => {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	res.locals.user = req.user || null;
	next();
});

//Create Local Strategy
require('../config/passport')(passport);

//Connect to mongoose
mongoose
	.connect('mongodb://localhost/photos', {
		useNewUrlParser: true,
		useUnifiedTopology: true
	})
	.then(() => console.log('Mongodb connected...'))
	.catch((err) => console.log(err));

//Server listening
const port = process.env.PORT || 5000;
app.listen(port, () => {
	console.log(`Server is listening on port ${port}`);
});

//Base page
app.get('/', (req, res) => {
	const text = 'Picka';
	res.render('index', { text: text });
});

//About page
app.get('/about', (req, res) => {
	res.render('about');
});

//Use posts.js export module to /posts route
app.use('/posts', posts);

//Use users.js export module to /users route
app.use('/users', users);