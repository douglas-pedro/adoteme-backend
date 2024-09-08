import { APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'

const cognito = new AWS.CognitoIdentityServiceProvider()

interface CreateUserEvent {
  name: string
  username: string
  password: string
  confirmPassword: string
  email: string
  phoneNumber: string
  cep: string
  address: string
  city: string
  complement: string
  district: string
  number: string
  phone: string
  responsibleName: string
  state: string
  type: string
}

export const signUp: APIGatewayProxyHandler = async (event) => {
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Solicitação inválida, falta parâmetro no corpo',
      }),
    }
  }

  const body: CreateUserEvent = JSON.parse(event.body)

  if (body.password !== body.confirmPassword) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'As senha não são iguais!',
      }),
    }
  }

  const params: AWS.CognitoIdentityServiceProvider.SignUpRequest = {
    ClientId: String(process.env.AWS_COGNITO_CLIENT_ID),
    Username: body.username,
    Password: body.password,
    UserAttributes: [
      {
        Name: 'email',
        Value: body.email,
      },
      {
        Name: 'name',
        Value: body.name,
      },

      {
        Name: 'phone_number',
        Value: body.phoneNumber,
      },
      {
        Name: 'custom:cep',
        Value: body.cep,
      },
      {
        Name: 'address',
        Value: body.address,
      },
      {
        Name: 'custom:city',
        Value: body.city,
      },
      {
        Name: 'custom:complement',
        Value: body.complement,
      },
      {
        Name: 'custom:district',
        Value: body.district,
      },
      {
        Name: 'custom:number',
        Value: body.number,
      },
      {
        Name: 'custom:phone',
        Value: body.phone,
      },
      {
        Name: 'custom:responsibleName',
        Value: body.responsibleName,
      },
      {
        Name: 'custom:state',
        Value: body.state,
      },
      {
        Name: 'custom:type',
        Value: body.type,
      },
    ],
  }

  try {
    const result = await cognito.signUp(params).promise()
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Usuário criado com sucesso.',
        user: result.UserSub,
      }),
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Erro ao tentar criar o usuário',
        error: errorMessage,
      }),
    }
  }
}
