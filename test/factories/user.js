const faker = require('faker')
const { User } = require('../../src/db')

const data = async (props = {}) => {
    const defaultProps = {
        email: faker.internet.email(),
        name: faker.name.firstName(),
        surname: faker.name.lastName(),
        password: '123'
    }
    return Object.assign({}, defaultProps, props)
}
module.exports = async (props = {}) => User.create(await data(props))
