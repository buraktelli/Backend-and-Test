const { setDatabaseConfig } = require('../entity/database-config-manager');
setDatabaseConfig({
    host: 'localhost',
    user: 'postgres',
    password: 'postgres',
    database: 'postgres',
    port: 5432,
    adminUsername: 'admin',
    adminPlainPassword: 'gizlisifrem',
});
const {app, initAdmin} = require('../app');
const { sequelize } = require('../entity/db');

sequelize.sync().then(() => {
    console.log('Connection has been established successfully.');
    initAdmin();
}).catch(err => {
    console.error('Unable to connect to the database:', err);
    process.exit(1);
});
app.listen(3000);