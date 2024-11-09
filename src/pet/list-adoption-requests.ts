import { PrismaClient } from '@prisma/client'
import { APIGatewayEvent, Context, APIGatewayProxyResult } from 'aws-lambda'

const prisma = new PrismaClient()

export const listAdoptionRequests = async (
  event: APIGatewayEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  try {
    const { ownerId } = JSON.parse(event.body || '{}')

    if (!ownerId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Owner ID is required' }),
      }
    }

    const userId = await prisma.userPet.findMany({
      where: { idCognito: ownerId },
    })

    const pets = await prisma.adoptionRequest.findMany({
      where: { requesterId: ownerId },
    })

    // Verifica se existe ao menos um pet e acessa `petId` com segurança
    const idPet = pets.length > 0 ? pets[0].petId : null

    // Obter os pets do usuário que possuem solicitações de adoção pendentes
    const petsWithRequests = await prisma.pet.findMany({
      where: {
        id: Number(idPet),
      },
      include: {
        adoptionRequests: {
          where: { status: 'PENDING' },
          include: { requester: true },
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
