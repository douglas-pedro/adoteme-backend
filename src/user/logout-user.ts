import { APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'

const cognito = new AWS.CognitoIdentityServiceProvider()

interface LogoutEvent {
  accessToken: string
}

export const logout: APIGatewayProxyHandler = async (event) => {
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Solicitação inválida, falta o corpo do parâmetro',
      }),
    }
  }

  const body: LogoutEvent = JSON.parse(event.body)

  const params: AWS.CognitoIdentityServiceProvider.GlobalSignOutRequest = {
    AccessToken: body.accessToken,
  }

  try {
    await cognito.globalSignOut(params).promise()
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'usuário desconectado com sucesso!',
      }),
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Erro ao tentar desconectar o usuário.',
        error: errorMessage,
      }),
    }
  }
}
