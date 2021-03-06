const request = require('supertest')
const faker = require('faker')
const expect = require('chai').expect
const truncate = require('../../../test/truncate')
const sync = require('../../../test/sync')
const timelogFactory = require('../../../test/factories/timelog')

const { API } = process.env

describe('DELETE /users/:userId/timelogs/:id ', function () {
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

    it('responds with no content', async () => {
        const createTimelog = (await timelogFactory({ userId })).toJSON()

        const id = createTimelog.id
        const getTimelog = await request(API)
            .del(`/users/${userId}/timelogs/${id}`)
            .set('Authorization', 'Bearer ' + token)

        expect(getTimelog.status).to.equal(204)
    })

    it('responds with timelog not found', async () => {
        const getTimelog = await request(API)
            .del(`/users/${userId}/timelogs/${faker.random.uuid()}`)
            .set('Authorization', 'Bearer ' + token)

        expect(getTimelog.status).to.equal(404)
    })

    it('should not be able to execute request if token is invalid', async () => {
        const timelog = await request(API)
            .del(`/users/${userId}/timelogs/${faker.random.uuid()}`)

        expect(timelog.status).to.equal(401)
    })
})
