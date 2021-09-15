const express = require('express')
const dotenv = require('dotenv').config()
const path = require('path')
const session = require('express-session')
const bcrypt = require('bcryptjs')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('./Models/user')
const Message = require('./Models/message')
const mongoose = require('mongoose')


mongoose.connect(process.env.DB_HOST)
const db = mongoose.connection
db.on('error', console.error.bind(console, 'mongo connection error'))

const app = express()
app.set('views', __dirname)
app.set('view engine', 'ejs')

app.use(session({ secret: 'cats', resave: false, saveUninitialized: true}))

passport.use(
    new LocalStrategy((username, password, done) => {
        User.findOne({userName: username}, (err, user) => {
            if(err){
                return done(err)
            }
            if(!user){
                return done(null, false, {message: 'User does not exist'})
            }
            if(user.password !== password){
                console.log(user.password, password)
                return done(null, false, {message: "This is the incorrect password, did you mean johnhopkins@gmail.com?"})
            }
            return done(null, user)
        })
    })
)
passport.serializeUser(function(user, done){
    done(null, user.id)
})
passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
        done(err,user)
    })
})
app.use(passport.initialize())
app.use(passport.session())
app.use(express.urlencoded({extended: false}))
app.use(express.static(__dirname + '/public'));

app.get('/', async (req, res) => {
    db.collection('messages').find({}).toArray(function(err, result){
        if(err) throw err
        res.render('./Views/index', {user: req.user, messages: result.reverse()})
    })
})
app.get('/sign-up', (req, res) => res.render('./Views/sign-up'))
app.get('/member', (req, res) => res.render('./Views/member', {user: req.user}))
app.get('/memberFailed', (req, res) => res.render('./Views/memberFailed', {user: req.user}))
app.get('/message', (req, res) => res.render('./Views/message.ejs', {user: req.user}))
app.get('/log-out', (req,res) => {
    req.logout()
    res.redirect('/')
})
app.get('/admin', (req,res) => res.render('./Views/admin', {user: req.user}))

app.post(
    '/log-in',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/sign-up'
    })
)

app.post("/sign-up", (req,res,next) => {
    const userName = req.body.userName ? req.body.userName : req.body.firstName + ' ' + req.body.lastName
        const user = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            userName: userName,
            email: req.body.email,
            password: req.body.password,
            status: 'Chump'
        }).save(err => {
            if(err){
                return next(err)
            }
        })
       res.redirect('/')
       next()
})
app.post('/check', (req,res,next) => {
    const letEmIn = req.body.password === 'Esambald'
    if(letEmIn){
        db.collection('users').updateOne(
            { 'userName': req.user.userName }, {
                $set: { 'status': 'Member'}
            }, (err) => {
                if(err) {
                    next()
                    throw err
                }
                console.log('Updated!')
                res.redirect('/')
                next()
            }
        )
    }
    else{
        res.redirect('/memberFailed')
        next()
    }
})
app.post('/message', (req,res,next) => {
    const message = new Message({
        date: new Date(),
        title: req.body.title,
        text: req.body.message,
        sender: req.user.userName
    }).save(err => {
        if(err){
            return next(err)
        }
        next()
    })
    res.redirect('/')
    next()
})
app.post('/bald', (req,res,next) => {
    const bald = req.body.password === 'pikachu busted'
    if(bald){
        db.collection('users').updateOne(
            { 'userName': req.user.userName }, {
                $set: { 'status': 'Admin'}
            }, (err) => {
                if(err) {
                    next()
                    throw err
                }
                console.log('Updated!')
                res.redirect('/')
                next()
            }
        )
    }
    else{
        res.redirect('/')
        next()
    }
})

app.listen(3000, () => {console.log('listening on port')})