const { respond, respondError } = require('../api-gateway-response')
const { StatusCodes, ReasonPhrases } = require('http-status-codes')
const { User } = require('../../db')
const { signToken } = require('../token-service')
const { ValidationError } = require('sequelize')

module.exports.handler = async (event, ctx, cb) => {
    const body = event.body || '{}'
    const { email, name, surname, password } = JSON.parse(body)

    if (!email || !name || !surname || !password) return respondError(StatusCodes.PRECONDITION_FAILED, 'Missing required params')

    try {
        await User.sync()
        const user = await User.create({ email, name, surname, password })
        return respond(StatusCodes.OK, {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                surname: user.surname
            },
            token: signToken({ userId: user.id, email })
        })
    } catch (error) {
        console.log('Problem executing request', error)
        if (error instanceof ValidationError) {
            if (error.errors[0].message === 'email must be unique') {
                return respondError(StatusCodes.PRECONDITION_FAILED, 'Email already registered.')
            } else {
                return respondError(StatusCodes.PRECONDITION_FAILED, error.errors[0].message)
            }
        }
        return respondError(StatusCodes.INTERNAL_SERVER_ERROR, ReasonPhrases.INTERNAL_SERVER_ERROR)
    }
}
