const jwt = require('jsonwebtoken')
const { respondError } = require('./api-gateway-response')
const { StatusCodes } = require('http-status-codes')
const { ACCESS_TOKEN_SECRET } = process.env

const verifyToken = event => {
    try {
        if (!event.headers || !event.headers.Authorization) {
            return respondError(StatusCodes.UNAUTHORIZED, 'Missing token')
        }

        const token = event.headers.Authorization.split(' ')[1]
        const decodedToken = jwt.verify(token, ACCESS_TOKEN_SECRET)

        const decodedUserId = decodedToken.userId

        const userId = event.pathParameters && event.pathParameters.userId
        if (!decodedUserId || (userId && userId !== decodedUserId)) {
            return respondError(StatusCodes.FORBIDDEN, 'Invalid token')
        }

        return { success: true }
    } catch (error) {
        console.log('Problem verifying token', error)
        return respondError(StatusCodes.FORBIDDEN, 'Please provide valid token.')
    }
}

const signToken = ({ userId, email }) => {
    const inOneHour = Math.floor(Date.now() / 1000) + 60 * 60
    return jwt.sign({ userId, email, exp: inOneHour }, ACCESS_TOKEN_SECRET)
}

module.exports = {
    verifyToken,
    signToken
}
