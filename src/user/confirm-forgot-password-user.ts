import { APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'

const cognito = new AWS.CognitoIdentityServiceProvider()

interface ConfirmForgotPasswordEvent {
  username: string
  confirmationCode: string
  newPassword: string
}

export const confirmForgotPassword: APIGatewayProxyHandler = async (event) => {
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Solicitação inválida, falta o corpo do parâmetro.',
      }),
    }
  }

  const body: ConfirmForgotPasswordEvent = JSON.parse(event.body)

  const params: AWS.CognitoIdentityServiceProvider.ConfirmForgotPasswordRequest =
    {
      ClientId: process.env.AWS_COGNITO_CLIENT_ID!,
      Username: body.username,
      ConfirmationCode: body.confirmationCode,
      Password: body.newPassword,
    }

  try {
    await cognito.confirmForgotPassword(params).promise()
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Senha redefinida com sucesso.',
      }),
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Erro ao tentar redefinir a senha. Tente novamente.',
        error: errorMessage,
      }),
    }
  }
}
