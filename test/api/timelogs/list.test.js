const request = require('supertest')
const expect = require('chai').expect
const truncate = require('../../../test/truncate')
const sync = require('../../../test/sync')
const timelogFactory = require('../../../test/factories/timelog')

const { API } = process.env

describe('GET /users/:userId/timelogs/:id', function () {
    let token
    let userId

    before(async () => {
        await sync()
    })

    beforeEach(async () => {
        await truncate()
        const createUser = await request(API)
            .post('/register')
            .send({ email: 'john.doe1@test.com', name: 'john', surname: 'doe', password: '123' })
            .set('Accept', 'application/json')

        userId = createUser.body.user.id
        token = createUser.body.token
    })

    it('responds with json data', async () => {
        await timelogFactory({ userId })

        const timelogs = await request(API)
            .get(`/users/${userId}/timelogs`)
            .set('Authorization', 'Bearer ' + token)

        expect(timelogs.status).to.equal(200)
        expect(timelogs.body.length).to.equal(1)
    })

    it('should be able to do basic pagination', async () => {
        await timelogFactory({ userId })
        await timelogFactory({ userId })
        const timelog3 = (await timelogFactory({ userId })).toJSON()

        const timelogs = await request(API)
            .get(`/users/${userId}/timelogs?limit=2&offset=2`)
            .set('Authorization', 'Bearer ' + token)

        expect(timelogs.status).to.equal(200)
        expect(timelogs.body.length).to.equal(1)
        expect(timelogs.body[0].id).to.equal(timelog3.id)
    })

    it('should not be able to execute request if token is invalid', async () => {
        const timelogs = await request(API)
            .get(`/users/${userId}/timelogs`)

        expect(timelogs.status).to.equal(401)
    })
})
