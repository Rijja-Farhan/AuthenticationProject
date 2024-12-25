const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const app = express();
const User = require('./models/User');


app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'goodsecret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } 
}));


const mongoURI = 'mongodb://localhost:27017/AuthenticationProject';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

app.set('view engine', 'ejs');
app.set('views', 'views');

// Routes
app.get('/', (req, res) => {
    res.render('main');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    try {
        const { password, username } = req.body;
        const hash = await bcrypt.hash(password, 12);
        const user = new User({ username, password: hash });
        await user.save();
        req.session.user_id = user._id;
        res.redirect('/');
    } catch (err) {
        console.log(err);
        res.redirect('/register');
    }
});

app.get('/login', (req, res) => {
    res.render('login');
});


app.post('/login', async (req, res) => {
    const { password, username } = req.body;
    console.log(password)
    const user = await User.findOne({ username });
    if (!user) {
        return res.redirect('/login'); 
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (validPassword) {
        req.session.user_id = user._id;
        res.redirect('/secret'); 
    } else 
    {
        console.log("wrong")
        res.redirect('/login'); 
    }
});


app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log(err);
            return res.redirect('/secret');
        }
        res.redirect('/login');
    });
});

app.get('/secret', (req, res) => {
    if (!req.session.user_id) {
        return res.redirect('/login');
    }
    res.render('secret');
});

// Server setup
app.listen(3000, () => {
    console.log(`Server is running on http://localhost:3000`);
});
