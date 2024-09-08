import { PrismaClient } from '@prisma/client'
import * as fs from 'fs-extra'
import { v4 as uuidv4 } from 'uuid'
import { APIGatewayProxyHandler } from 'aws-lambda'
import * as path from 'path'

const prisma = new PrismaClient()

export const createPet: APIGatewayProxyHandler = async (event) => {
  try {
    const data = JSON.parse(event.body || '{}')
    const {
      name,
      type,
      gender,
      age,
      special_condition,
      idCognito,
      address,
      images,
    } = data

    if (
      !name ||
      !type ||
      !gender ||
      !age ||
      !idCognito ||
      !images ||
      images.length === 0 ||
      !address
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required fields' }),
      }
    }

    // Verificar se o UserPet já existe com base no idCognito
    let userPet = await prisma.userPet.findUnique({
      where: { idCognito },
    })

    // Se o UserPet não existir, criá-lo
    if (!userPet) {
      userPet = await prisma.userPet.create({
        data: {
          idCognito,
        },
      })
    }

    // Criar o novo Pet no banco de dados, associando ao UserPet
    const newPet = await prisma.pet.create({
      data: {
        name,
        type,
        gender,
        age,
        special_condition: special_condition || 'Nenhuma',
        userPetId: userPet.id, // Associar ao UserPet criado ou existente
        address: {
          create: {
            zipCode: address.zipCode,
            address: address.address,
            number: address.number,
            complement: address.complement,
            district: address.district,
            state: address.state,
          },
        },
      },
    })

    // Criar pasta local com base no ID do Pet
    const petFolder = path.join(__dirname, `uploads/pets/${newPet.id}`)
    await fs.ensureDir(petFolder)

    // Salvar as imagens no diretório e armazenar o caminho no banco de dados
    const savedImages = []
    for (const image of images) {
      const imageId = uuidv4() // Gerar ID único para o nome da imagem
      const imageFileName = `${imageId}-${image.fileName}`
      const imagePath = path.join(petFolder, imageFileName)

      // Simular salvar o arquivo de imagem (em um ambiente real, você iria salvar o arquivo)
      await fs.writeFile(imagePath, image.fileContent, 'base64')

      // Ler o arquivo de imagem salvo e converter para base64
      const imageBuffer = await fs.readFile(imagePath)
      const base64Image = imageBuffer.toString('base64')

      // Salvar o caminho da imagem no banco de dados
      const savedImage = await prisma.petImage.create({
        data: {
          fileName: image.fileName,
          avatarPath: image.avatarPath || false,
          path: imagePath, // Caminho completo do arquivo salvo
          petId: newPet.id,
        },
      })

      // Adicionar imagem com base64 ao array de imagens salvas
      savedImages.push({
        ...savedImage,
        base64: `data:image/jpeg;base64,${base64Image}`, // Retorna a imagem em base64
      })
    }

    return {
      statusCode: 201,
      body: JSON.stringify({ pet: newPet, images: savedImages }),
    }
  } catch (error) {
    console.error('Error creating pet:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error creating pet' }),
    }
  }
}
