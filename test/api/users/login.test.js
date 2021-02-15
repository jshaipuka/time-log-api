const request = require('supertest')
const expect = require('chai').expect
const truncate = require('../../../test/truncate')
const sync = require('../../../test/sync')
const userFactory = require('../../../test/factories/user')

const { API } = process.env

describe('POST /login', function () {
    before(async () => {
        await sync()
    })

    beforeEach(async () => {
        await truncate()
        await userFactory({ email: 'john.doe1@test.com', password: '123' })
    })

    it('responds with json', async () => {
        const loginUser = await request(API)
            .post('/login')
            .send({ email: 'john.doe1@test.com', password: '123' })
            .set('Accept', 'application/json')

        expect(loginUser.status).to.equal(200)
        expect(loginUser.body.token).to.not.equal(null)
    })

    it('responds with user unauthorised', async () => {
        const loginUser = await request(API)
            .post('/login')
            .send({ email: 'john.doe@test.com', password: '123' })
            .set('Accept', 'application/json')

        expect(loginUser.status).to.equal(401)
    })

    it('responds with missing required params', async () => {
        const loginUser = await request(API)
            .post('/login')
            .send({ email: 'john.doe@test.com' })
            .set('Accept', 'application/json')

        expect(loginUser.status).to.equal(412)
        expect(loginUser.text).to.equal('{"errorMessage":"Missing required params"}')
    })
})
