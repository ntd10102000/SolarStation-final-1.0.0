module.exports = (sequelize, Sequelize) => {
    const SolarStation = sequelize.define("solar_station", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        ma_kh: {
            type: Sequelize.STRING
        },
        lat: {
            type: Sequelize.NUMERIC
        },
        long: {
            type: Sequelize.NUMERIC
        },
        geom: {
            type: Sequelize.GEOMETRY
        },
    });

    return SolarStation;
};