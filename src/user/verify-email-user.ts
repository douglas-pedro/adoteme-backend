import { APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'

const cognito = new AWS.CognitoIdentityServiceProvider({
  region: 'us-east-1', // Certifique-se de que isso está configurado corretamente
})

interface CheckEmailEvent {
  email: string
}

export const checkEmail: APIGatewayProxyHandler = async (event) => {
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Solicitação inválida, falta o corpo do parâmetro',
      }),
    }
  }

  const body: CheckEmailEvent = JSON.parse(event.body)

  const params: AWS.CognitoIdentityServiceProvider.ListUsersRequest = {
    UserPoolId: String(process.env.AWS_COGNITO_USER_POOL_ID),
    Filter: `email = "${body.email}"`,
    Limit: 1, // Limit to one result for efficiency
  }

  try {
    const result = await cognito.listUsers(params).promise()

    if (result.Users && result.Users.length > 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'O email já está registrado.',
          userExists: true,
        }),
      }
    } else {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'O email não está registrado.',
          userExists: false,
        }),
      }
    }
  } catch (error) {
    console.log(error)
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Erro ao tentar verificar o email.',
        error: errorMessage,
      }),
    }
  }
}
