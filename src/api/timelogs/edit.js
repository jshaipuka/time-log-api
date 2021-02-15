const { respond, respondError } = require('../api-gateway-response')
const { StatusCodes, ReasonPhrases } = require('http-status-codes')
const { Timelog } = require('../../db')
const { verifyToken } = require('../token-service')
const validateDates = require('../validate-dates')

module.exports.handler = async (event, ctx, cb) => {
    const { userId, id } = event.pathParameters || {}
    const body = event.body || '{}'
    const { description, startDateTime, endDateTime } = JSON.parse(body)

    if (!description && !startDateTime && !endDateTime) return respondError(StatusCodes.PRECONDITION_FAILED, 'At least one of description, startDateTime, endDateTime is required.')

    const tokenVerificationResult = verifyToken(event)
    if (!tokenVerificationResult.success) return tokenVerificationResult

    try {
        await Timelog.sync()
        const timelog = await Timelog.findByPk(id)

        if (!timelog) return respondError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND)

        if (!timelog.endDateTime) return respondError(StatusCodes.PRECONDITION_FAILED, 'Timelog has not ended')

        timelog.description = description || timelog.description
        timelog.startDateTime = startDateTime || timelog.startDateTime
        timelog.endDateTime = endDateTime || timelog.endDateTime

        const dateValidationResult = await validateDates(timelog.startDateTime, timelog.endDateTime, userId, timelog.id)
        if (!dateValidationResult.success) return dateValidationResult

        await timelog.save()
        return respond(StatusCodes.OK, timelog.toJSON())
    } catch (err) {
        console.log('Problem executing request', err)
        return respondError(StatusCodes.INTERNAL_SERVER_ERROR, ReasonPhrases.INTERNAL_SERVER_ERROR)
    }
}
