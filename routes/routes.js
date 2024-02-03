const express = require('express');
const session = require('express-session')
const router = express.Router();
const users = require('../data/users')
const {generateToken, verifyToken} = require('../middlewares/authMiddleware')
const  hashedSecret = require('../crypto/config')

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

router.use(
    session({
        secret: hashedSecret,
        resave: false,
        saveUninitialized: true,
        cookie: {secure: false},
    })
)


router.get('/', (req, res) => {
    const loginForm = `<!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
    </head>
    <body>
        
        <form action="/login" method="post">
            <label for="username">Usuario:</label>
            <input type="text" id="username" name="username" required><br>
            <label for="password">Contraseña:</label>
            <input type="password" id="password" name="password" required><br>
            <button type="submit">Iniciar sesión</button>
        </form>
        <a href="/dashboard">dashboard</a>

    </body>
    </html>

`;

res.send(loginForm);
});

router.post('/login', (req, res) => {
    const {username, password} = req.body
    const user = users.find(user => user.username === username && user.password === password)

    if(user){
        const token = generateToken(user)
        req.session.token = token;
        res.redirect('/dashboard')
    }else{
        res.status(401).json('Credenciales incorrectas')

    }
})

router.get('/dashboard',verifyToken,(req, res) => {
    const userId = req.user
    const user = users.find(user => user.id === userId)
    if(user) {
        res.send(`<!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
        </head>
        <body>
            <h1>Bienvenido</h1>
            <button>Logout</button>
        </body>
        </html>
        `)
    }else{
        res.status(404).json({mensaje:'usuario no encontrado'})
    }
})

module.exports = router