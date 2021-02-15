const { Op, Sequelize } = require('sequelize')
const { respondError } = require('./api-gateway-response')
const { StatusCodes } = require('http-status-codes')
const { Timelog } = require('../db')

module.exports = async (startDateTime, endDateTime, userId, timelogId) => {
    try {
        const start = new Date(startDateTime)
        const end = endDateTime ? new Date(endDateTime) : start

        if (end < start) {
            return respondError(StatusCodes.PRECONDITION_FAILED, 'endDateTime cannot come before startDateTime')
        }

        const hasOverlappingTimelog = await Timelog.findAll({
            where: {
                userId,
                [Op.all]: Sequelize.literal(`(start_date_time, end_date_time) OVERLAPS (to_timestamp(${start.getTime() / 1000}), to_timestamp(${end.getTime() / 1000}))`)
            }
        })

        if (hasOverlappingTimelog.length && hasOverlappingTimelog.filter(item => item.id !== timelogId).length) {
            return respondError(StatusCodes.PRECONDITION_FAILED, 'Timelog overlaps')
        }
    } catch (error) {
        console.log('Problem executing request', error)
        return respondError(StatusCodes.INTERNAL_SERVER_ERROR, ReasonPhrases.INTERNAL_SERVER_ERROR)
    }

    return { success: true }
}
