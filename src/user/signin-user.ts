import { APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'

const cognito = new AWS.CognitoIdentityServiceProvider()

interface SignInEvent {
  username: string
  password: string
}

export const signIn: APIGatewayProxyHandler = async (event) => {
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Solicitação inválida, falta o corpo do parâmetro',
      }),
    }
  }

  const body: SignInEvent = JSON.parse(event.body)

  const params: AWS.CognitoIdentityServiceProvider.InitiateAuthRequest = {
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: String(process.env.AWS_COGNITO_CLIENT_ID),
    AuthParameters: {
      USERNAME: body.username,
      PASSWORD: body.password,
    },
  }

  try {
    const result = await cognito.initiateAuth(params).promise()
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Usuário conectado com sucesso.',
        accessToken: result.AuthenticationResult?.AccessToken,
        idToken: result.AuthenticationResult?.IdToken,
        refreshToken: result.AuthenticationResult?.RefreshToken,
      }),
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Erro ao tentar conectar o usuário.',
        error: errorMessage,
      }),
    }
  }
}
