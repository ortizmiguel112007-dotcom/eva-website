import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('L7iF84c!xJ9', 10)

  const admin = await prisma.user.upsert({
    where: {
      email: 'admin@eva.com',
    },
    update: {
      rol: 'admin',
      verificado: true,
      activo: true,
    },
    create: {
      nombre: 'Administrador EVA',
      email: 'admin@eva.com',
      telefono: '3000000000',
      password,
      verificado: true,
      activo: true,
      rol: 'admin',
    },
  })

  console.log('Administrador creado:', admin.email)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })