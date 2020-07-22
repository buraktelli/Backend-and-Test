const Sequelize = require('sequelize');
const Model = Sequelize.Model;
const { getDatabaseConfig } = require('./database-config-manager');
const config = getDatabaseConfig();

if (config === null) {
    console.log('getDatabaseConfig returns null')
    process.exit(1);
}
const sequelize = new Sequelize(config.database, config.user, config.password, {
    host: config.host,
    dialect: 'postgres',
    port: config.port,

    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});
class User extends Model { }
User.init({
    username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
    }
}, {
    sequelize,
    tableName: 'user',
})
class Intersection extends Model { }
Intersection.init({
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    geom: {
        type: Sequelize.GEOMETRY('POINT', 4326),
    }
}, {
    sequelize,
    tableName: 'intersection'
});
module.exports = {
    Intersection,
    User,
    sequelize
};