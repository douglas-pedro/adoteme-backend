import { PrismaClient } from '@prisma/client'
import { APIGatewayEvent, Context, APIGatewayProxyResult } from 'aws-lambda'

const prisma = new PrismaClient()

export const createAdoptionRequest = async (
  event: APIGatewayEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  try {
    const petId = event.pathParameters?.id
    console.log(event.body)
    const { requesterId } = JSON.parse(event.body || '{}') // Fazendo parse do body para obter requesterId

    console.log('XXXXXXXXXXXXXX', requesterId)

    if (!petId || !requesterId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Pet ID and Requester ID are required',
        }),
      }
    }

    // Verificar se o pet existe e está disponível para adoção
    const pet = await prisma.pet.findUnique({
      where: { id: Number(petId) },
      include: { userPet: true },
    })

    if (!pet || !pet.adoption) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: 'Pet not found or not available for adoption',
        }),
      }
    }

    const userRequest = await prisma.userPet.findUnique({
      where: { idCognito: requesterId },
    })

    console.log('XXXXX', userRequest)

    // Criar a solicitação de adoção
    const adoptionRequest = await prisma.adoptionRequest.create({
      data: {
        petId: pet.id,
        requesterId: String(requesterId),
        status: 'PENDING',
      },
    })

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: 'Adoption request created',
        adoptionRequest,
      }),
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
