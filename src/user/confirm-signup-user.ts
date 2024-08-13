import { APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'

const cognito = new AWS.CognitoIdentityServiceProvider()

interface ConfirmSignUpEvent {
  username: string
  confirmationCode: string
}

export const confirmSignUp: APIGatewayProxyHandler = async (event) => {
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Invalid request, you are missing the parameter body',
      }),
    }
  }

  const body: ConfirmSignUpEvent = JSON.parse(event.body)

  const params: AWS.CognitoIdentityServiceProvider.ConfirmSignUpRequest = {
    ClientId: String(process.env.AWS_COGNITO_CLIENT_ID),
    Username: body.username,
    ConfirmationCode: body.confirmationCode,
  }

  try {
    await cognito.confirmSignUp(params).promise()
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'User confirmed successfully',
      }),
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error confirming user',
        error: errorMessage,
      }),
    }
  }
}
