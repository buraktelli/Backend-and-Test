const { getDatabaseConfig } = require('./entity/database-config-manager');
const express = require('express');
const app = express()
const hasha = require('hasha');
const jwt = require('jsonwebtoken')
const bodyParser = require("body-parser");
const cors = require('cors');
const Joi = require('@hapi/joi');
const { Intersection, User, sequelize, } = require('./entity/db');
const { async } = require('hasha');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.use(cors());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200'),
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,DELETE,PUT')
    next();
})
const outCheck = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization
        //console.log(authorization)
        if (authorization) {
            const token = authorization.replace('Bearer ', '')
            const decoded = await jwt.verify(token, 'PRIVATE_KEY');
            next()
            return
        } throw new Error('Invalid token')
    } catch (err) {
        return res.status(401).json(err)
    }
}
app.post('/api/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ where: { username } });
        const hashPassword = await hasha.async(password);
        if (user.password !== hashPassword || user === null) {
            throw new Error('User not found');
        }
        const token = jwt.sign({ id: user.id }, 'PRIVATE_KEY', { expiresIn: '1d' })
        res.json({ token });
    } catch (error) {
        next(error);
    }
})
app.post('/api/register', async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const hashPassword = await hasha.async(password)
        const result = await User.create({
            username: username,
            password: hashPassword
        })
        const user = await User.findOne({ where: { username } });
        const token = jwt.sign({ id: user.id }, 'PRIVATE_KEY', { expiresIn: '1d' })
        res.json({ token })
    } catch (error) {
        next()
    }
})
app.get('/api/intersection', outCheck, async (req, res, next) => {
    try {
        const intersections = await Intersection.findAll();
        res.json(intersections);
    } catch (error) {
        next(error);
    }
})
app.post('/api/intersection/insert/', outCheck, async (req, res, next) => {
    try {
        const data = req.body;
        //console.log(data)
        const schema = Joi.object().keys({
            name: Joi.string().min(3).max(50).required(),
            x: Joi.number().min(10).max(50).required(),
            y: Joi.number().min(10).max(50).required()
        });
        const { value, error } = schema.validate(req.body);
        if (error) {
            console.log(error)
            throw error;
        }
        const point = {
            type: 'Point',
            coordinates: [parseFloat(req.body.x), parseFloat(req.body.y)],
            crs: { type: 'name', properties: { name: 'EPSG:4326' } }
        };
        const result = await Intersection.create({
            name: req.body.name,
            geom: point,
            
        })
        res.json(result)
    } catch (error) {
        next(error);
    };
});
app.delete('/api/intersection/:id', outCheck, async (req, res, next) => {
    try {
        const schema = Joi.object().keys({
            id: Joi.number().min(1).max(100).required()
        });
        const { value, error } = schema.validate(req.params);
        if (error) {
            throw error;
        }
        const result = await Intersection.destroy({
            where: {
                id: req.params.id
            }
        }).then((row) => {
            if (row === 1) {
                // console.log('Delete successfull')
            } else { throw Error; }

        }, (err) => {
            console.log(err)
        })
        res.json(result);
    } catch (error) {
        next(error);
    }
});
app.get('/api/intersection/update/:id', outCheck, async (req, res, next) => {
    try {
        const schema = Joi.object().keys({
            id: Joi.number().min(1).max(100).required()
        });
        const { value, error } = schema.validate(req.params);
        if (error) {
            throw error;
        }
        const intersection = await Intersection.findAll({
            where: {
                id: req.params.id
            }
        })
        var result;
        if (intersection.length > 0) {
            result = await Intersection.update(
                { name: 'asd' },
                {
                    where: { id: req.params.id }
                })
        } else {
            console.log('Kayıt bulunamadı')
            throw Error
        }
        res.json(result);
    } catch (error) {
        next(error);
    }
});
app.use((error, req, res, next) => {
    res.status(400).json({
        log: 'Deneme',
        error
    });
});
const initAdmin = async () => {
    const dbConfig = getDatabaseConfig();
    const hashPassword = await hasha.async(dbConfig.adminPlainPassword)
    await User.findOrCreate({
        where: { username: dbConfig.adminUsername },
        defaults: {
            username: dbConfig.adminUsername,
            password: hashPassword
        }
    })

}
const add = async (a,b) => {
    return a+b
}
module.exports = {
    app,
    initAdmin,
    add,
    
};