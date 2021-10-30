module.exports = (sequelize, Sequelize) => {
    const Company = sequelize.define("companies", {
        companyName: {
            type: Sequelize.STRING
        }
    });

    return Company;
};