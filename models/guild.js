const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const Guild = sequelize.define('guild', {
    id: {
        type: Sequelize.STRING,
        // cannot be null, has to be unique
        primaryKey: true
    },
    welcomeChannelId: {
        type: Sequelize.STRING,
        allowNull: true
    },
    welcomeRoleId: {
        type: Sequelize.STRING,
        allowNull: true
    },
    playHour: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    playMinutes: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    playDate: {
        type: Sequelize.DATE,
        allowNull: true
    },
    playChannelId: {
        type: Sequelize.STRING,
        allowNull: true
    },
    AMorPM: {
        type: Sequelize.STRING,
        allowNull: true
    }
});

module.exports = Guild;