import { PrismaClient } from '@prisma/client'
import { APIGatewayEvent, Context, APIGatewayProxyResult } from 'aws-lambda'

const prisma = new PrismaClient()

export const listAdoptionRequests = async (
  event: APIGatewayEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  try {
    const { ownerId } = JSON.parse(event.body || '{}')

    console.log(ownerId)

    if (!ownerId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Owner ID is required' }),
      }
    }

    const petsWithRequests = await prisma.userPet.findMany({
      where: {
        idCognito: ownerId,
      },
      include: {
        pets: {
          include: {
            adoptionRequests: true,
            images: true,
          },
        },
      },
    })

    if (!petsWithRequests) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: 'No adoption requests found for this owner',
        }),
      }
    }

    console.log(petsWithRequests)

    return {
      statusCode: 200,
      body: JSON.stringify(petsWithRequests),
    }
  } catch (error) {
    console.error(error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    }
  } finally {
    await prisma.$disconnect()
  }
}
