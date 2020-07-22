let config = null;
const setDatabaseConfig = (conf) => {
    config = conf;
}
const getDatabaseConfig = () => {
    return config;
}
module.exports = {
    setDatabaseConfig,
    getDatabaseConfig,
}