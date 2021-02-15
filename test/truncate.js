const { User, Timelog } = require('../src/db')

module.exports = async function truncate () {
    await Timelog.destroy({ where: {}, force: true })
    await User.destroy({ where: {}, force: true })
}
