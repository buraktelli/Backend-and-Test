const { setDatabaseConfig } = require('../entity/database-config-manager')
setDatabaseConfig({
    host: 'localhost',
    user: 'postgres',
    password: 'postgres',
    database: 'postgres',
    port: 5554,
    adminUsername: 'adminTest',
    adminPlainPassword: 'gizlisifrem',
});
const { sequelize, Intersection, User } = require('../entity/db');
const request = require('supertest');
const { app, initAdmin } = require('../app');

describe('app test', () => {
    beforeAll(async () => {
        sequelize.options.logging = false
        await sequelize.sync({ force: true });
        await initAdmin();
    })
    afterAll(async () => {
        await sequelize.close();
    })
    it('should be login', async () => {
        const res = await request(app).post('/api/login')
            .send({
                username: 'adminTest',
                password: 'gizlisifrem'
            });
        expect(res.status).toEqual(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body).not.toHaveProperty('error');
        this.token = res.body.token
    })
    it('Should register a user', async () => {
        const res = await request(app).post('/api/register')
            .send({
                username: 'registerTest',
                password: 'registerTest'
            });
        expect(res.status).toEqual(200);
    })
    it('Should get all intersections', async () => {
        //console.log('this token', this.token)
        const res = await request(app).get('/api/intersection')
            .set('Authorization', 'Bearer ' + this.token);
        expect(res.status).toEqual(200);
        expect(Array.isArray(res.body)).toEqual(true);
        expect(res.body.length).toEqual(0);
    });
    it('Should insert intersection', async () => {
        const res = await request(app).post('/api/intersection/insert')
            .set('Authorization', 'Bearer ' + this.token)
            .send({
                name: 'Java Functional Interface',
                x: 10,
                y: 10
            }).catch(err => console.log(`Error ${err}`));
        expect(res.body.name).toEqual('Java Functional Interface')
        expect(res.status).toEqual(200)
    })
    it('Should update intersection', async () => {
        const res = await request(app).get('/api/intersection/update/1')
            .set('Authorization', 'Bearer ' + this.token)
            .catch(err => console.log(`Error ${err}`));
        expect(res.status).toEqual(200)
    })
    it('Should delete intersection', async () => {
        const res = await request(app).delete('/api/intersection/1')
            .set('Authorization', 'Bearer ' + this.token)
            .catch(err => console.log(`Error ${err}`));
        expect(res.status).toEqual(200)
    })

    // it('Should get all intersections with Promise', async () => {
    //     const res = await request(app).get('/api/intersections')
    //         .set('Authorization', 'Bearer ' + this.token);
    //     const status = await new Promise((resolve, reject) => {
    //         if (res.status == 200) {
    //             resolve('Status dogru...')
    //         } else {
    //             reject('Hatalı status: ' + res.status)
    //         }
    //     }).then((result) => {
    //         return result
    //     }, (err) => {
    //         return err
    //     })
    //     const length = await new Promise((resolve, reject) => {
    //         if (res.body.length == 0) {
    //             resolve('Lenght dogru...')
    //         } else {
    //             reject('Hatalı length: ' + res.body.length)
    //         }
    //     }).then((result) => {
    //         return result
    //     }, (err) => {
    //         return err
    //     })
    //     const body = await new Promise((resolve, reject) => {
    //         if (Array.isArray(res.body) == true) {
    //             resolve('Body dogru...')
    //         } else {
    //             reject('Hatalı body: ' + res.body)
    //         }
    //     }).then((result) => {
    //         return result
    //     }, (err) => {
    //         return err
    //     })

    //     const final = Promise.all([status, length, body])
    //     final.then((result) => {
    //         console.log('Sonuclar: ', result)
    //     }, (err) => {
    //         console.log(err)
    //     })
    // })






    // it('should not login', async () => {
    //     const res = await request(app).post('/api/login')
    //         .send({
    //             username: 'admin1',
    //             password: 'gizlisifrem'
    //         });
    //     expect(res.status).toEqual(400);
    //     expect(res.body).toHaveProperty('error');
    //     expect(res.body).not.toHaveProperty('token');
    // })
    // it('check adminUser', async () => {
    //     const admin = await User.findOne({ where: { username: 'adminTest' } })
    //     expect(admin).toHaveProperty('id');
    //     expect(admin).toHaveProperty('username');
    //     expect(admin).toHaveProperty('password');
    //     console.log(admin.username);
    //     expect(admin.password).not.toEqual('gizlisifrem')
    // })
    // it('should add interseciton', async () => {
    //     const intersection = await Intersection.create({
    //         name: 'test',
    //         geom: null
    //     });
    //     expect(intersection).toHaveProperty('id');
    //     expect(intersection.id).toEqual(2);
    // })
    // it('should add user', async () => {
    //     const user = await User.create({
    //         username: 'test',
    //         password: 'gizlisifrem'
    //     });
    //     expect(user).toHaveProperty('id');
    //     //expect(user.id).toEqual(1);
    // })

});
