const expect = require('chai').expect
const { Op, Sequelize } = require('sequelize')
const truncate = require('../../../test/truncate')
const sync = require('../../../test/sync')
const { Timelog } = require('../../../src/db')
const userFactory = require('../../../test/factories/user')
const timelogFactory = require('../../../test/factories/timelog')

describe('Timelog model', () => {
    let user

    before(async () => {
        await sync()
    })

    beforeEach(async () => {
        await truncate()
        user = await userFactory()
    })

    it('with all data', async () => {
        const startDateTime = new Date('2010-05-20')
        const endDateTime = new Date('2010-05-21')
        const timelogData = {
            description: 'This is a description',
            startDateTime,
            endDateTime,
            userId: user.id
        }

        const newTimelog = await Timelog.create(timelogData)
        expect(newTimelog.description).to.equal('This is a description')
        expect(newTimelog.startDateTime.getTime()).to.equal(startDateTime.getTime())
        expect(newTimelog.endDateTime.getTime()).to.equal(endDateTime.getTime())
        expect(newTimelog.userId).to.equal(user.id)

        const foundTimelog = await Timelog.findByPk(newTimelog.id)
        expect(foundTimelog.id).to.equal(newTimelog.id)
        expect(foundTimelog.description).to.equal('This is a description')
        expect(foundTimelog.startDateTime.getTime()).to.equal(startDateTime.getTime())
        expect(foundTimelog.endDateTime.getTime()).to.equal(endDateTime.getTime())
        expect(foundTimelog.userId).to.equal(user.id)
    })

    it('without end time', async () => {
        const timelog = await timelogFactory({ endDateTime: null })
        expect(timelog.endDateTime).to.equal(null)
    })

    it('should update a timelog by id', async () => {
        const timelog = await timelogFactory({ endDateTime: null })

        const endDateTime = new Date('2010-05-21')
        timelog.endDateTime = endDateTime

        await timelog.save()

        const foundTimelog = await Timelog.findByPk(timelog.id)
        expect(foundTimelog.id).to.equal(timelog.id)
        expect(foundTimelog.endDateTime.getTime()).to.equal(endDateTime.getTime())
    })

    it('should delete a timelog by id', async () => {
        const timelog = await timelogFactory()

        const foundTimelog = await Timelog.findByPk(timelog.id)
        expect(foundTimelog.id).to.equal(timelog.id)

        await timelog.destroy()

        const notFound = await Timelog.findByPk(timelog.id)
        expect(notFound).to.equal(null)
    })

    it('should list all timelogs by user', async () => {
        await Promise.all([
            timelogFactory({ userId: user.id }),
            timelogFactory({ userId: user.id }),
            timelogFactory({ userId: user.id }),
            timelogFactory(),
            timelogFactory()
        ])

        const userTimelogs = await Timelog.findAll({ where: { userId: user.id } })

        expect(userTimelogs).to.have.lengthOf(3)
        expect(userTimelogs[0].userId).to.equal(user.id)
    })

    it('should list all timelogs by user and paginate', async () => {
        await timelogFactory({ userId: user.id })
        const timelog2 = await timelogFactory({ userId: user.id })
        await timelogFactory({ userId: user.id })

        const userTimelogs = await Timelog.findAll({ limit: 2, offset: 1, where: { userId: user.id } })

        expect(userTimelogs).to.have.lengthOf(2)
        expect(userTimelogs[0].userId).to.equal(user.id)
        expect(userTimelogs[0].id).to.equal(timelog2.id)
    })

    it('should find overlapping timelogs by user', async () => {
        const may20 = new Date('2010-05-20')
        const may21 = new Date('2010-05-21')
        const may22 = new Date('2010-05-22')

        const timelog1 = await timelogFactory({ userId: user.id, startDateTime: may20, endDateTime: may22 })

        const userTimelogs = await Timelog.findAll({
            where: {
                userId: user.id,
                [Op.all]: Sequelize.literal(`(start_date_time, end_date_time) OVERLAPS (to_timestamp(${new Date(may21).getTime() / 1000}),
            to_timestamp(${new Date(may21).getTime() / 1000}))`)
            }
        })

        expect(userTimelogs).to.have.lengthOf(1)
        expect(userTimelogs[0].userId).to.equal(user.id)
        expect(userTimelogs[0].id).to.equal(timelog1.id)
    })
})
