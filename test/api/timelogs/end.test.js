const request = require('supertest')
const faker = require('faker')
const expect = require('chai').expect
const truncate = require('../../../test/truncate')
const sync = require('../../../test/sync')
const timelogFactory = require('../../../test/factories/timelog')

const { API } = process.env

describe('PUT /users/:userId/timelogs/:id/end', function () {
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
        const may20 = new Date('2010-05-20')
        const may21 = new Date('2010-05-21')

        const createTimelog = (await timelogFactory({ userId, startDateTime: may20, endDateTime: null })).toJSON()
        const timelog = await request(API)
            .put(`/users/${userId}/timelogs/${createTimelog.id}/end`)
            .send({ endDateTime: may21 })
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer ' + token)

        expect(timelog.status).to.equal(200)
        expect(timelog.body.id).to.equal(createTimelog.id)
        expect(timelog.body.description).to.equal(createTimelog.description)
        expect(new Date(timelog.body.startDateTime).getTime()).to.equal(may20.getTime())
        expect(new Date(timelog.body.endDateTime).getTime()).to.equal(may21.getTime())
    })

    it('should not be able to update if timelog has ended', async () => {
        const may20 = new Date('2010-05-20')
        const may21 = new Date('2010-05-21')

        const createTimelog = (await timelogFactory({ userId, startDateTime: may20, endDateTime: may21 })).toJSON()
        const timelog = await request(API)
            .put(`/users/${userId}/timelogs/${createTimelog.id}/end`)
            .send({ endDateTime: may21 })
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer ' + token)

        expect(timelog.status).to.equal(412)
        expect(timelog.body.errorMessage).to.equal('Timelog has ended')
    })

    it('should not be able to update if timelog start date is later than end date', async () => {
        const may20 = new Date('2010-05-20')
        const may21 = new Date('2010-05-21')

        const createTimelog = (await timelogFactory({ userId, startDateTime: may21, endDateTime: null })).toJSON()
        const timelog = await request(API)
            .put(`/users/${userId}/timelogs/${createTimelog.id}/end`)
            .send({ endDateTime: may20 })
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer ' + token)

        expect(timelog.status).to.equal(412)
        expect(timelog.body.errorMessage).to.equal('endDateTime cannot come before startDateTime')
    })

    it('should not be able to update if timelog dates overlap with other timelogs', async () => {
        const may20 = new Date('2010-05-20')
        const may21 = new Date('2010-05-21')
        const may22 = new Date('2010-05-22')

        await timelogFactory({ userId, startDateTime: may21, endDateTime: may22 })
        const createTimelog = (await timelogFactory({ userId, startDateTime: may20, endDateTime: null })).toJSON()

        const timelog = await request(API)
            .put(`/users/${userId}/timelogs/${createTimelog.id}/end`)
            .send({ endDateTime: may22 })
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer ' + token)

        expect(timelog.status).to.equal(412)
        expect(timelog.body.errorMessage).to.equal('Timelog overlaps')
    })

    it('responds with timelog not found', async () => {
        const timelog = await request(API)
            .put(`/users/${userId}/timelogs/${faker.random.uuid()}/end`)
            .send({ description: 'ABC', startDateTime: new Date(), endDateTime: new Date() })
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer ' + token)

        expect(timelog.status).to.equal(404)
    })

    it('should not be able to execute request if token is invalid', async () => {
        const timelog = await request(API)
            .put(`/users/${userId}/timelogs/${faker.random.uuid()}/end`)
            .send({ description: 'ABC', startDateTime: new Date(), endDateTime: new Date() })
            .set('Accept', 'application/json')

        expect(timelog.status).to.equal(401)
    })
})
