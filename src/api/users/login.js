const { respond, respondError } = require('../api-gateway-response')
const { StatusCodes, ReasonPhrases } = require('http-status-codes')
const { User } = require('../../db')
const { signToken } = require('../token-service')

module.exports.handler = async (event, ctx, cb) => {
    const body = event.body || '{}'
    const { email, password } = JSON.parse(body)

    if (!email || !password) return respondError(StatusCodes.PRECONDITION_FAILED, 'Missing required params')

    try {
        await User.sync()
        const user = await User.findOne({ where: { email } })

        if (user && await user.comparePassword(password)) {
            return respond(StatusCodes.OK, {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    surname: user.surname
                },
                token: signToken({ userId: user.id, email })
            })
        }

        return respondError(StatusCodes.UNAUTHORIZED, 'Email or password invalid.')
    } catch (error) {
        console.log('Problem executing request', error)
        return respondError(StatusCodes.INTERNAL_SERVER_ERROR, ReasonPhrases.INTERNAL_SERVER_ERROR)
    }
}
