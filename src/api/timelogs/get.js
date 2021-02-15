const { respond, respondError } = require('../api-gateway-response')
const { StatusCodes, ReasonPhrases } = require('http-status-codes')
const { Timelog } = require('../../db')
const { verifyToken } = require('../token-service')

module.exports.handler = async (event, ctx, cb) => {
    const { id } = event.pathParameters

    const tokenVerificationResult = verifyToken(event)
    if (!tokenVerificationResult.success) return tokenVerificationResult

    try {
        await Timelog.sync()
        const timelog = await Timelog.findByPk(id)

        if (timelog) {
            return respond(StatusCodes.OK, timelog)
        }
        return respondError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND)
    } catch (err) {
        console.log('Problem executing request', err)
        return respondError(StatusCodes.INTERNAL_SERVER_ERROR, ReasonPhrases.INTERNAL_SERVER_ERROR)
    }
}
