const bcrypt = require('bcryptjs')
const { DataTypes, Sequelize } = require('sequelize')

const TABLE_NAME = 'user'

module.exports = sequelize => {
    const User = sequelize.define('user',
        {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: true
                }
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            surname: {
                type: DataTypes.STRING,
                allowNull: false
            },
            password: {
                type: DataTypes.STRING(64),
                allowNull: false,
                validate: {
                    notEmpty: true
                }
            }
        },
        {
            tableName: TABLE_NAME,
            freezeTableName: true,
            indexes: [
                {
                    unique: true,
                    fields: ['email']
                }
            ],
            hooks: {
                beforeCreate: (user, options) => {
                    user.password = user.password ? bcrypt.hashSync(user.password, 10) : ''
                }
            }
        })

    User.prototype.comparePassword = function (password) {
        return bcrypt.compare(password, this.password)
    }

    return User
}
