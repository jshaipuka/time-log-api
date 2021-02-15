const { User, Timelog } = require('../src/db')

module.exports = async function sync () {
    await User.sync()
    await Timelog.sync()
}
