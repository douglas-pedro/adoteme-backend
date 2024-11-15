import { APIGatewayProxyHandler } from 'aws-lambda'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface LikePetEventBody {
  idCognito: string
  petId: number
}

export const likePet: APIGatewayProxyHandler = async (event) => {
  try {
    const body: LikePetEventBody = JSON.parse(event.body || '{}')
    const { idCognito, petId } = body

    if (!idCognito || !petId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'idCognito and petId are required' }),
      }
    }

    // Check if the like already exists
    const existingLike = await prisma.likesPet.findUnique({
      where: {
        idCognito_petId: { idCognito, petId },
      },
    })

    if (existingLike) {
      return {
        statusCode: 409,
        body: JSON.stringify({
          message: 'Like already exists for this user and pet',
        }),
      }
    }

    // Log the ids for troubleshooting purposes
    console.log('Attempting to add like:', { idCognito, petId })

    // Create the like and increment the pet's like count in a transaction
    const [newLike] = await prisma.$transaction([
      prisma.likesPet.create({
        data: {
          idCognito,
          petId,
        },
      }),
      prisma.pet.update({
        where: { id: petId },
        data: { like: { increment: 1 } },
      }),
    ])

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: 'Like created successfully',
        like: newLike,
      }),
    }
  } catch (error: any) {
    console.error('Error creating like:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'An error occurred while creating the like',
        error: error.message,
      }),
    }
  } finally {
    await prisma.$disconnect()
  }
}
