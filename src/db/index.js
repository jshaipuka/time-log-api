require('dotenv').config()
const { Sequelize } = require('sequelize')

const { DB_URI } = process.env
const sequelize = new Sequelize(DB_URI)

const userModel = require('./models/user')
const timelogModel = require('./models/timelog')

const User = userModel(sequelize)
const Timelog = timelogModel(sequelize)

User.hasMany(Timelog, {
    foreignKey: {
        field: 'userId',
        allowNull: false
    },
    onDelete: 'cascade'
})
Timelog.belongsTo(User, {
    foreignKey: {
        field: 'userId',
        allowNull: false
    },
    onDelete: 'cascade'
})

module.exports = {
    User,
    Timelog,
    sequelize
}
