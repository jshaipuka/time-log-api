const { respond, respondError } = require('../api-gateway-response')
const { StatusCodes, ReasonPhrases } = require('http-status-codes')
const { Timelog } = require('../../db')
const { verifyToken } = require('../token-service')
const validateDates = require('../validate-dates')

module.exports.handler = async (event, ctx, cb) => {
    const { userId } = event.pathParameters || {}
    const body = event.body || '{}'
    const { description, startDateTime, endDateTime } = JSON.parse(body)

    if (!description || !startDateTime) return respondError(StatusCodes.PRECONDITION_FAILED, 'Missing required params')

    const tokenVerificationResult = verifyToken(event)
    if (!tokenVerificationResult.success) return tokenVerificationResult

    try {
        await Timelog.sync()
        const dateValidationResult = await validateDates(startDateTime, endDateTime, userId)
        if (!dateValidationResult.success) return dateValidationResult

        const timelog = await Timelog.create({ description, startDateTime, endDateTime, userId })
        return respond(StatusCodes.CREATED, timelog.toJSON())
    } catch (err) {
        console.log('Problem executing request', err)
        return respondError(StatusCodes.INTERNAL_SERVER_ERROR, ReasonPhrases.INTERNAL_SERVER_ERROR)
    }
}
