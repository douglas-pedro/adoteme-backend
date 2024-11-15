import { PrismaClient } from '@prisma/client'
import { APIGatewayEvent, Context, APIGatewayProxyResult } from 'aws-lambda'

const prisma = new PrismaClient()

export const removeAdoptionRequest = async (
  event: APIGatewayEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  try {
    const adoptionRequestId = event.pathParameters?.id

    if (!adoptionRequestId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Adoption Request ID is required',
        }),
      }
    }

    console.log('ID', adoptionRequestId)

    // Verificar se a solicitação de adoção existe
    const adoptionRequest = await prisma.adoptionRequest.findUnique({
      where: { id: Number(adoptionRequestId) },
    })

    if (!adoptionRequest) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: 'Adoption request not found',
        }),
      }
    }

    // Remover a solicitação de adoção
    await prisma.adoptionRequest.delete({
      where: { id: Number(adoptionRequestId) },
    })

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Adoption request removed successfully',
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
