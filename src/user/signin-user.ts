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
    // Autenticação do usuário
    const authResult = await cognito.initiateAuth(params).promise()

    if (!authResult.AuthenticationResult?.AccessToken) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Falha na autenticação, access token não encontrado.',
        }),
      }
    }

    const accessToken = authResult.AuthenticationResult.AccessToken

    // Obter informações do usuário usando o access token
    const userParams: AWS.CognitoIdentityServiceProvider.GetUserRequest = {
      AccessToken: accessToken,
    }

    const userResult = await cognito.getUser(userParams).promise()

    // Extrair atributos do usuário
    const userAttributes = userResult.UserAttributes?.reduce(
      (acc, attribute) => {
        acc[attribute.Name] = attribute.Value
        return acc
      },
      {} as { [key: string]: string },
    )

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Usuário conectado com sucesso.',
        accessToken: authResult.AuthenticationResult.AccessToken,
        idToken: authResult.AuthenticationResult.IdToken,
        refreshToken: authResult.AuthenticationResult.RefreshToken,
        userInfo: {
          userId: userAttributes?.sub,
          email: userAttributes?.email,
          name: userAttributes?.name,
          type: userAttributes?.['custom:type'],
        },
      }),
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Erro desconhecido'
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Erro ao tentar conectar o usuário.',
        error: errorMessage,
      }),
    }
  }
}
