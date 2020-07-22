const { Pool, Client } = require('pg')
const port = 3000
const { request } = require('express');
const crypto = require('crypto');

const express = require('express')
const bodyParser = require("body-parser");
const session = require('express-session');

const app = express()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
const cors = require('cors');
app.use(cors())

app.use(session({ secret: "Your secret key" }));
const jwt = require('jsonwebtoken')

const client = new Client({
    user: 'postgres',
    // host: 'localhost',
    host: '127.0.0.1',
    database: 'postgres',
    password: 'postgres',
    port: 5430
})
client.connect().then(() => {
    console.log('BAĞLANDI')
}).catch(e => {
    console.log('DB HATASI', e);
    process.exit(1);
});
client.query('select now()', (err, res) => {
    if (!err) {
        console.log("Baglati basarili")
    }
})
console.log("deneme")


const users = [
    //{ id: 1, username: 'test', password: 'test', firstName: 'Test', lastName: 'User' }
]

app.post('/api/signup', (req, res) => {
    console.log(req.body)
    if (!req.body.username || !req.body.password) {
        return res.status(404).send({
            message: 'Email and password can not be empty!',
        });
    } else {

        users.filter((user) => {
            if (user.username == req.body.username) {
                console.log('Already exist')
            }
        })
        const newUser = {
            username: req.body.username,
            password: req.body.password,
            firstname: req.body.firstname,
            lastName: req.body.lastname
        }
        users.push(newUser)
        req.session.user = newUser;
        console.log('asd',req.session.user)
        res.json(req.session.user)
    }
    console.log('users',users)
})
app.post('/api/signin', (req, res) => {
    console.log('signin', users)
    const username = req.body.username;
    const password = req.body.password
    
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) console.log('Username or password incorrect')

    const token = jwt.sign({ sub: user.id }, 'secret.key', { expiresIn: '7d' });

    return res.status(200).send({ message: 'success', token: token });

})
app.get('/api/intersections', (req, res) => {

    client.query('SELECT *, st_asText(geom) as coord, st_asGeojson(geom), st_x(geom) as x, st_y(geom) as y FROM intersections', (err, data) => {
        if (err) {
            console.log("Error receiving data ", err);
            res.status(400).json({
                error: err
            })
        } else {
            res.json(data.rows)
        }

    })
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
})
app.get('/api/intersections/update/:id', (req, res) => {
    //console.log('param', req.params.id)
    const queryOpts = {
        text: "UPDATE intersections SET intersection_type='vd' WHERE id=$1 returning *",
        values: [req.params.id]
    }
    client.query(queryOpts, (err, result) => {
        if (err) {
            console.log("Guncelleme islemi basarisiz", err);
            res.status(400).json({
                error: err
            })
        } else {
            res.json(result.rows)
        }
    })
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');

})
app.get('/api/intersections/delete/:id', (req, res) => {
    console.log('param', req.params)
    //const query = 'DELETE FROM intersections WHERE id=' + req.params.id + "returning *"
    const queryOpts = {
        text: 'DELETE FROM intersections WHERE id=$1 returning *',
        values: [req.params.id]
    }
    client.query(queryOpts, (err, result) => {
        if (err) {
            console.log("Silme islemi basarisiz", err);
            res.json({
                error: err
            })
        } else {
            res.json(result.rows)
        }
    })
    console.log('delete query', queryOpts)

    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');

})
app.post('/api/intersections/envelope/', (req, res) => {
    const body = req.body;
    const query = {
        text: 'SELECT st_astext(st_Envelope(st_setsrid(st_makeline(st_makepoint(28, 40), st_makepoint(29,41)), 4326))) from intersections where id=12'

    }
    client.query(query, (err, data) => {
        if (err) {
            console.log("Ekleme islemi basarisiz", err);
            res.json({
                error: err
            })
        } else {
            // res.json(data.rows[0].st_envelope)
            res.json(data.rows[0].st_astext)
            console.log(data.rows[0].st_astext)

        }
    })

    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,DELETE,PUT');
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    console.log(body)
})


app.post('/api/intersections/insert', (req, res) => {
    const body = req.body
    console.log("deneme insert")
    
    const queryOpts = {
        text: 'INSERT INTO intersections (name, address, code, ip_address, geom)VALUES($1, $2, $3, $4, st_setsrid(st_makepoint($5,$6),4326)) returning *',
        values: [
            body.name,
            body.address,
            body.code,
            body.ip_address,
            parseFloat(body.x),
            parseFloat(body.y)
        ]
    }
    //console.log(query)
    client.query(queryOpts, (err, result) => {
        if (err) {
            console.log("Ekleme islemi basarisiz", err);
            res.json({
                error: err
            })
        } else {
            res.json(result.rows)
        }
    })
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,DELETE,PUT');
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    console.log('body', req.body)
    
})



app.listen(port)