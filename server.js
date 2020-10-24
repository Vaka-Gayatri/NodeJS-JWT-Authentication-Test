const express = require('express');
const app = express();

const jwt = require('jsonwebtoken');
const exjwt = require('express-jwt');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type,Authorization');
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));


const PORT = 3000;

const secretKey = 'My super secret key';
const jwtMW = exjwt({
    secret: secretKey,
    algorithms: ['HS256']
});

let users = [
    {
        id:1,
        username:'Gayatri',
        password: '123'
    },
    {
        id:2,
        username: 'Vaka',
        password: '456'
    }
]

app.post('/api/login',(req,res)=>{
    const {username,password} = req.body;
    let foundUser = false;
    for(let user of users) {
        if(username === user.username && password === user.password) {
            // Step4:In the NodeJS, change the JWT expire to 3 minutes
            let token = jwt.sign({id:user.id,username:user.username},secretKey,{expiresIn: '3 min'});
            foundUser = true;
            res.json({
                success: true,
                err:null,
                token
            });
            break;
        }   
    }

    if (!foundUser) {
        res.status(401).json({
            success:false,
            token:null,
            err: 'Username or Password is incorrect'
        });
    } 
}); 




app.get('/api/dashboard', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'Secret content that only logged in people can see.'
    });
});

app.get('/api/prices', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'This is the price $3.99'
    });
});

// Step1: Create 1 more route (called settings) and protect this route with the JWT 
app.get('/api/settings', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'You can change the website settings here.'
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join( __dirname , 'index.html'));
})

app.use(function (err, req, res, next){
    console.log(err.name === 'UnauthorizedError');
    console.log(err);
   
   
   

    if(err.name === 'UnauthorizedError'){
        // Step5: Backend code JWT is expired, then the page will reload on the root address
        if(err.inner.name === 'TokenExpiredError'){
            console.log('************Your token got expired please login again**********');
            window.location.href = '/';

        } else{
        res.status(401).json({
            success: false,
            officialError: err,
            err: 'Username or password is incorrect 2'
        });
    }
    }
    else {
        next(err);
    }
});



    
  

app.listen(PORT, () => {
    console.log(`Serving on port ${PORT}`);
})