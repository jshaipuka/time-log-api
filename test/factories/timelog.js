const faker = require('faker')
const { Timelog } = require('../../src/db')
const userFactory = require('./user')

const data = async (props = {}) => {
    let userId = ''

    if (!props.userId) {
        const user = await userFactory()
        userId = user.id
    }

    const defaultProps = {
        userId,
        description: faker.company.catchPhrase(),
        startDateTime: faker.date.between('2015-01-01', '2015-01-05'),
        endDateTime: faker.date.between('2015-01-06', '2015-01-15')
    }

    return Object.assign({}, defaultProps, props)
}

module.exports = async (props = {}) => Timelog.create(await data(props))
