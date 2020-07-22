const { setDatabaseConfig } = require('../entity/database-config-manager');
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
const api = require('../app');


describe('unit test', () => {
    beforeAll(async () => {
        //await initAdmin();
    })
    afterAll(async () => {

    })
    it('should be login', async () => {
        spyOn(User, 'findOne').and.returnValue({
            id: 1,
            username: 'adminTest',
            password: '9ed4938412f4bda2b7003b77ee1e91fb8674077d7511db815e1f76801c7a212ce8f62344bfb156202fb3a2523964f53152715437e29c069fbb1cd5e7c1619718'
        });
        const res = await request(app).post('/api/login')
            .send({
                username: 'adminTest',
                password: 'gizlisifrem'
            });
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toBeCalledWith({ where: { username: 'adminTest' } })
        expect(res.status).toEqual(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body).not.toHaveProperty('error');
        this.token = res.body.token
    })
    it('should not be login', async () => {
        spyOn(User, 'findOne').and.returnValue(null);
        const res = await request(app).post('/api/login')
            .send({
                username: 'adminTest',
                password: 'gizlisifrem'
            });
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toBeCalledWith({ where: { username: 'adminTest' } })
        expect(res.status).toEqual(400);
        expect(res.body).not.toHaveProperty('token');
        expect(res.body).toHaveProperty('error');
    })
})
