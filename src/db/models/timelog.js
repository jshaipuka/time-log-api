const { DataTypes, Sequelize } = require('sequelize')

const TABLE_NAME = 'timelog'

module.exports = sequelize => {
    return sequelize.define('timelog', {
        id: {
            type: DataTypes.UUID,
            defaultValue: Sequelize.UUIDV4,
            unique: true,
            primaryKey: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        startDateTime: {
            type: DataTypes.DATE,
            allowNull: false
        },
        endDateTime: {
            type: DataTypes.DATE
        }
    }, { tableName: TABLE_NAME, freezeTableName: true, underscored: true })
}
