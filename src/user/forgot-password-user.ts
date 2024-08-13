import { APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'

const cognito = new AWS.CognitoIdentityServiceProvider()

interface ForgotPasswordEvent {
  username: string
}

export const forgotPassword: APIGatewayProxyHandler = async (event) => {
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Solicitação inválida, falta o corpo do parâmetro.',
      }),
    }
  }

  const body: ForgotPasswordEvent = JSON.parse(event.body)

  const params: AWS.CognitoIdentityServiceProvider.ForgotPasswordRequest = {
    ClientId: process.env.AWS_COGNITO_CLIENT_ID!,
    Username: body.username,
  }

  try {
    await cognito.forgotPassword(params).promise()
    return {
      statusCode: 200,
      body: JSON.stringify({
        message:
          'A redefinição de senha foi iniciada com sucesso. Verifique seu e-mail para obter o código de verificação.',
      }),
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Erro ao solicitar a redefinição de senha. Tente novamente.',
        error: errorMessage,
      }),
    }
  }
}
