const respond = (statusCode, data = {}) => ({
    statusCode,
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
})

const respondError = (statusCode, errorMessage) => {
    const error = errorMessage ? { body: JSON.stringify({ errorMessage: errorMessage }) } : {}
    return ({
        statusCode,
        ...error
    })
}

module.exports = {
    respond,
    respondError
}
