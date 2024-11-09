import { PrismaClient } from '@prisma/client'
import { APIGatewayEvent, Context, APIGatewayProxyResult } from 'aws-lambda'

const prisma = new PrismaClient()

export const approveAdoptionRequest = async (
  event: APIGatewayEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  try {
    const requestId = event.pathParameters?.requestId
    const ownerId = event.requestContext.authorizer?.principalId

    if (!requestId || !ownerId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Request ID and Owner ID are required',
        }),
      }
    }

    // Verificar se a solicitação existe e se o usuário é o dono do pet
    const adoptionRequest = await prisma.adoptionRequest.findUnique({
      where: { id: Number(requestId) },
      include: { pet: true },
    })

    if (!adoptionRequest) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Adoption request not found' }),
      }
    }

    if (adoptionRequest.pet.userPetId !== Number(ownerId)) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          message: 'You are not authorized to approve this request',
        }),
      }
    }

    // Atualizar o status da solicitação para 'REJECTED'
    await prisma.adoptionRequest.update({
      where: { id: Number(requestId) },
      data: { status: 'REJECTED' },
    })

    // Atualizar o status de adoção do pet para false (não disponível)
    await prisma.pet.update({
      where: { id: adoptionRequest.petId },
      data: { adoption: false },
    })

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Adoption request approved' }),
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
