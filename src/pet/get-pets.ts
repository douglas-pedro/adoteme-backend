import { PrismaClient } from '@prisma/client'
import { APIGatewayProxyHandler } from 'aws-lambda'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface ListPetsRequest {
  id?: number
  type?: string
  gender?: string
  age?: number
  special_condition?: string
  state?: string
  limit?: number
  cursor?: number
  idCognito?: string
}

export const listPets: APIGatewayProxyHandler = async (event) => {
  const data = JSON.parse(event.body || '{}')

  const {
    id,
    type,
    gender,
    age,
    special_condition,
    state,
    limit = 10, // Número de pets por página
    cursor,
    idCognito, // Capturar o idCognito
  } = data

  const filters: any = {}

  // Construção dos filtros dinamicamente
  if (id) {
    filters.id = Number(id)
  }

  if (type) {
    filters.type = type
  }

  if (gender) {
    filters.gender = gender
  }

  if (age) {
    filters.age = age
  }

  if (special_condition) {
    filters.special_condition = special_condition
  }

  if (state) {
    filters.address = {
      state,
    }
  }

  if (idCognito) {
    filters.userPet = {
      idCognito, // Filtro pelo idCognito no relacionamento com UserPet
    }
  }

  try {
    const pets = await prisma.pet.findMany({
      where: filters,
      include: {
        address: true,
        images: true,
        userPet: true,
      },
      take: limit,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Processar imagens em base64 como antes
    const petsWithImagesInBase64 = await Promise.all(
      pets.map(async (pet) => {
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

        return {
          ...pet,
          images: imagesInBase64,
        }
      }),
    )

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: petsWithImagesInBase64,
        cursor: pets.length > 0 ? pets[pets.length - 1].id : null,
      }),
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to list pets',
        details: error,
      }),
    }
  }
}
