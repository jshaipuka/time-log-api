const { respond, respondError } = require('../api-gateway-response')
const { StatusCodes, ReasonPhrases } = require('http-status-codes')
const { Timelog } = require('../../db')
const { verifyToken } = require('../token-service')

module.exports.handler = async (event, ctx, cb) => {
    const { userId } = event.pathParameters
    const queryStringParameters = event.queryStringParameters || {}
    const { limit, offset } = queryStringParameters

    const tokenVerificationResult = verifyToken(event)
    if (!tokenVerificationResult.success) return tokenVerificationResult

    try {
        await Timelog.sync()
        const userTimelogs = await Timelog.findAll({ limit, offset, where: { userId } })
        return respond(StatusCodes.OK, userTimelogs)
    } catch (err) {
        console.log('Problem executing request', err)
        return respondError(StatusCodes.INTERNAL_SERVER_ERROR, ReasonPhrases.INTERNAL_SERVER_ERROR)
    }
}
