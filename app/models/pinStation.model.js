module.exports = (sequelize, Sequelize) => {
    const PinStation = sequelize.define("pinStations", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true
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

    return PinStation;
};