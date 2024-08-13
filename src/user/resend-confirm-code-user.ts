import { APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'

const cognito = new AWS.CognitoIdentityServiceProvider()

interface ResendConfirmationCodeEvent {
  username: string
}

export const resendConfirmationCode: APIGatewayProxyHandler = async (event) => {
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Invalid request, you are missing the parameter body',
      }),
    }
  }

  const body: ResendConfirmationCodeEvent = JSON.parse(event.body)

  const params: AWS.CognitoIdentityServiceProvider.ResendConfirmationCodeRequest =
    {
      ClientId: process.env.CLIENT_ID!,
      Username: body.username,
    }

  try {
    await cognito.resendConfirmationCode(params).promise()
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Confirmation code resent successfully',
      }),
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error resending confirmation code',
        error: errorMessage,
      }),
    }
  }
}
