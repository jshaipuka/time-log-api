# Timelog management API

The API is built to run on an AWS environment.

AWS API Gateway is setup and for each API endpoint a lambda function is created. Deployment happens with [Serverless Framework](https://www.serverless.com/). Please see configured routes in the `serverless.yml` file.

Part of deployment is simplified and presumes that you have AWS RDS Postgres instance up and running.

You can access deployed version of API here: https://gyrone4s8k.execute-api.eu-north-1.amazonaws.com/prod

Example of requests:

```
curl -d '{ "email": "test@test.com", "name": "test", "surname": "test",  "password": "test" }' https://gyrone4s8k.execute-api.eu-north-1.amazonaws.com/prod/register
```

```
curl -H "Authorization: Bearer token" -d '{ "description": "test", "startDateTime": "2015-05-01T19:38:34.203Z",  "endDateTime": "2015-05-02T19:38:34.203Z" }' https://gyrone4s8k.execute-api.eu-north-1.amazonaws.com/prod/users/{userId}/timelogs
curl -H "Authorization: Bearer token" -d '{ "description": "test", "startDateTime": "2015-05-01",  "endDateTime": "2015-05-02" }' https://gyrone4s8k.execute-api.eu-north-1.amazonaws.com/prod/users/{userId}/timelogs
```


## Installation

1. Install npm dependencies

```
npm install
```
   
2. Install docker from [official site](https://docs.docker.com/get-docker/) and run:

```
docker build -t db-image-time-management .
docker run -d --name db-time-management -p 5432:5432 db-image-time-management
```

Note: This step is required only if you don't already have Postgres DB locally installed.

3. Create `.env.dev` file and fill environmental variables:

```
ACCESS_TOKEN_SECRET=<secret for jwt>
DB_URI=<postgres db>
API=http://localhost:3000/dev
```

Note: If you created Postgres DB with Docker then DB_URI will be `postgres://postgres:postgres@localhost:5432/time_management` or `postgres://postgres:postgres@192.168.1.101:5432/time_management`

## Running locally

Start Serverless Framework in offline mode

```
npm start
```

## Testing locally

1. Serverless Framework in offline mode should be running
2. Run npm test

```
npm test
```

## Deployment

Pre-requisites:
1. AWS account.
2. AWS CLI is installed and configured with valid credentials.
3. AWS RDS Postgres instance is up and running.

Deployment:

1. Create `.env.prod` file (dev is the default stage that Serverless Framework is configured to run in this example).

```
ACCESS_TOKEN_SECRET=<secret for jwt>
DB_URI=<postgres db>
SUBNET=<subnet where your DB and lambdas reside>
SECURITY_GROUP=<security group that your DB and lambdas use>
```

2. Run deployment script
```
npm deploy
```

3. Done!