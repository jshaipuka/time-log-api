const expect = require('chai').expect
const sync = require('../../../test/sync')
const { User } = require('../../../src/db')

describe('User model', () => {
    before(async () => {
        await sync()
    })

    it('should create a user', async () => {
        const userData = {
            email: 'john.doe@missing.com',
            name: 'John',
            surname: 'Doe',
            password: '123'
        }

        const newUser = await User.create(userData)

        expect(newUser.email).to.equal('john.doe@missing.com')
        expect(newUser.name).to.equal('John')
        expect(newUser.surname).to.equal('Doe')

        const foundUser = await User.findByPk(newUser.id)

        expect(foundUser.id).to.equal(newUser.id)
        expect(foundUser.email).to.equal('john.doe@missing.com')
        expect(foundUser.name).to.equal('John')
        expect(foundUser.surname).to.equal('Doe')
        expect(foundUser.password).to.not.equal('123')
    })

    it('should not create a user with missing attributes', async () => {
        try {
            const userData = {
                email: null,
                name: null,
                surname: null,
                password: null
            }
            await User.create(userData)
            throw new Error('Should thrown')
        } catch (error) {
            error.errors.forEach(e => {
                expect(e.type).to.equal('notNull Violation')
            })
        }
    })

    it('should not create a user with same email', async () => {
        try {
            const userData = {
                email: 'john.doe@missing.com',
                name: 'John',
                surname: 'Doe',
                password: '123'
            }
            await User.create(userData)
            await User.create(userData)
            throw new Error('Should thrown')
        } catch (error) {
            expect(error.errors[0].message).to.equal('email must be unique')
            expect(error.errors[0].type).to.equal('unique violation')
            expect(error.errors[0].path).to.equal('email')
            expect(error.errors[0].value).to.equal('john.doe@missing.com')
        }
    })

    it('should not create a user with empty email', async () => {
        try {
            const userData = {
                email: '',
                name: 'John',
                surname: 'Doe',
                password: '123'
            }
            await User.create(userData)
            throw new Error('Should thrown')
        } catch (error) {
            expect(error.errors[0].message).to.equal('Validation isEmail on email failed')
            expect(error.errors[0].path).to.equal('email')
        }
    })
})
