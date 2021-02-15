require('dotenv').config()
const request = require('supertest')
const expect = require('chai').expect
const truncate = require('../../../test/truncate')
const sync = require('../../../test/sync')

const { API } = process.env

describe('POST /register', function () {
    before(async () => {
        await sync()
    })

    beforeEach(async () => {
        await truncate()
    })

    it('responds with json', async () => {
        const registerUser = await request(API)
            .post('/register')
            .send({ email: 'john.doe1@test.com', name: 'john', surname: 'doe', password: '123' })
            .set('Accept', 'application/json')

        expect(registerUser.status).to.equal(200)
    })

    it('responds with email already registered', async () => {
        await request(API)
            .post('/register')
            .send({ email: 'john.doe1@test.com', name: 'john', surname: 'doe', password: '123' })
            .set('Accept', 'application/json')

        const registerUser = await request(API)
            .post('/register')
            .send({ email: 'john.doe1@test.com', name: 'john', surname: 'doe', password: '123' })
            .set('Accept', 'application/json')

        expect(registerUser.status).to.equal(412)
        expect(registerUser.text).to.equal('{"errorMessage":"Email already registered."}')
    })

    it('responds with email is not valid', async () => {
        const registerUser = await request(API)
            .post('/register')
            .send({ email: 'john.doe1', name: 'john', surname: 'doe', password: '123' })
            .set('Accept', 'application/json')

        expect(registerUser.status).to.equal(412)
        expect(registerUser.text).to.equal('{"errorMessage":"Validation isEmail on email failed"}')
    })

    it('responds with missing required params', async () => {
        const registerUser = await request(API)
            .post('/register')
            .send({ email: 'john.doe@test.com' })
            .set('Accept', 'application/json')

        expect(registerUser.status).to.equal(412)
        expect(registerUser.text).to.equal('{"errorMessage":"Missing required params"}')
    })
})
