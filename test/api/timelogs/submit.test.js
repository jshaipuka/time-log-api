const request = require('supertest')
const expect = require('chai').expect
const truncate = require('../../../test/truncate')
const sync = require('../../../test/sync')
const { API } = process.env

describe('POST /users/:userId/timelogs', function () {
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

    it('responds with json', async () => {
        const startDateTime = new Date('2010-05-20')
        const endDateTime = new Date('2010-05-21')

        const createTimelog = await request(API)
            .post(`/users/${userId}/timelogs`)
            .send({ description: 'This is a description', startDateTime, endDateTime })
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer ' + token)

        expect(createTimelog.status).to.equal(201)
    })

    it('should be able to create without end date', async () => {
        const startDateTime = new Date('2010-05-20')

        const createTimelog = await request(API)
            .post(`/users/${userId}/timelogs`)
            .send({ description: 'This is a description', startDateTime })
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer ' + token)

        expect(createTimelog.status).to.equal(201)
    })

    it('should not be able to create timelog with endDate sooner than startDate', async () => {
        const endDateTime = new Date('2010-05-20')
        const startDateTime = new Date('2010-05-21')

        const createTimelog = await request(API)
            .post(`/users/${userId}/timelogs`)
            .send({ description: 'This is a description', startDateTime, endDateTime })
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer ' + token)

        expect(createTimelog.status).to.equal(412)
    })

    it('should not be able to create timelog with overlapping dates', async () => {
        const may20 = new Date('2010-05-20')
        const may21 = new Date('2010-05-21')
        const may22 = new Date('2010-05-22')

        await request(API)
            .post(`/users/${userId}/timelogs`)
            .send({ description: 'This is a description', startDateTime: may20, endDateTime: may22 })
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer ' + token)

        const createTimelog = await request(API)
            .post(`/users/${userId}/timelogs`)
            .send({ description: 'This is a description', startDateTime: may21, endDateTime: may22 })
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer ' + token)

        expect(createTimelog.status).to.equal(412)
    })

    it('should not be able to create timelog if token is invalid', async () => {
        const endDateTime = new Date('2010-05-20')
        const startDateTime = new Date('2010-05-21')

        const createTimelog = await request(API)
            .post(`/users/${userId}/timelogs`)
            .send({ description: 'This is a description', startDateTime, endDateTime })
            .set('Accept', 'application/json')

        expect(createTimelog.status).to.equal(401)
    })
})
