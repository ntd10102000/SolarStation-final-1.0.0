module.exports = (sequelize, Sequelize) => {
    const Province = sequelize.define("provinces", {
        provinceName: {
            type: Sequelize.STRING
        }
    });

    return Province;
};