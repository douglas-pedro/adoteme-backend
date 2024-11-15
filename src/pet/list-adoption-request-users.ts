import { APIGatewayProxyHandler } from 'aws-lambda'
import { PrismaClient } from '@prisma/client'
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()
const cognitoClient = new CognitoIdentityProviderClient({ region: 'us-east-1' })

export const handler: APIGatewayProxyHandler = async (event) => {
  const { petId } = event.pathParameters as { petId: string }

  try {
    // Obter dados do pet e solicitações de adoção no banco de dados
    const pet = await prisma.pet.findUnique({
      where: { id: Number(petId) },
      include: {
        adoptionRequests: {
          select: {
            requesterId: true,
            status: true,
            createdAt: true,
            id: true,
          },
        },
        images: true,
        address: true,
      },
    })

    if (!pet) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Pet not found' }),
      }
    }

    // Converter as imagens do pet para base64
    const imagesInBase64 = await Promise.all(
      pet.images.map(async (image) => {
        const imagePath = path.resolve(image.path)
        const imageBuffer = fs.readFileSync(imagePath)
        const base64Image = imageBuffer.toString('base64')
        return {
          ...image,
          path: `data:image/jpeg;base64,${base64Image}`,
        }
      }),
    )

    // Obter IDs dos usuários que solicitaram adoção
    const requesterIds = pet.adoptionRequests.map(
      (request) => request.requesterId,
    )

    // Obter dados dos usuários no Cognito
    const userPromises = requesterIds.map(async (requesterId) => {
      const command = new ListUsersCommand({
        UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID!,
        Filter: `sub = "${requesterId}"`,
      })

      const response = await cognitoClient.send(command)
      const user = response.Users ? response.Users[0] : null

      console.log(user?.Attributes)

      return user
        ? {
            id: requesterId,
            email:
              user.Attributes?.find((attr) => attr.Name === 'email')?.Value ||
              '',
            name:
              user.Attributes?.find((attr) => attr.Name === 'name')?.Value ||
              '',
            phone:
              user.Attributes?.find((attr) => attr.Name === 'custom:phone')
                ?.Value || '',
            city:
              user.Attributes?.find((attr) => attr.Name === 'custom:city')
                ?.Value || '',
            state:
              user.Attributes?.find((attr) => attr.Name === 'custom:state')
                ?.Value || '',
          }
        : null
    })

    const users = (await Promise.all(userPromises)).filter(
      (user) => user !== null,
    )

    // Retornar dados do pet com imagens em base64 e solicitações de adoção
    return {
      statusCode: 200,
      body: JSON.stringify({
        pet: {
          id: pet.id,
          name: pet.name,
          type: pet.type,
          gender: pet.gender,
          age: pet.age,
          special_condition: pet.special_condition,
          adoption: pet.adoption,
          like: pet.like,
          createdAt: pet.createdAt,
          images: imagesInBase64, // Imagens em base64 no path
          address: pet.address,
          adoptionRequests: pet.adoptionRequests.map((request) => ({
            requester: users.find((user) => user?.id === request.requesterId),
            status: request.status,
            createdAt: request.createdAt,
            id: request.id,
          })),
        },
      }),
    }
  } catch (error) {
    console.error('Error fetching adoption requests:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    }
  }
}
