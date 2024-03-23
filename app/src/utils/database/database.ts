import { PrismaClient, PlayerIdentity } from '@prisma/client'

const prismaClientSingleton = ()=>{
  return new  PrismaClient().$extends({
    model: {
      player: {
        async findOrCreate(playerIdentity:PlayerIdentity){
          return database.player.create({data:{
            steamID: playerIdentity.Steamid,
            name: playerIdentity.Nickname,
          }})
        },
      },
    },
  })
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

export const database = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV === 'development') globalThis.prismaGlobal = database;



//awesome post for features: https://github.com/prisma/prisma/issues/7161#issuecomment-1026317110
//custom computed fields: https://www.prisma.io/docs/orm/prisma-client/queries/computed-fields
//custom validation: https://www.prisma.io/docs/concepts/components/prisma-client/custom-validation
// !!! custom models: .findManyByDomain() : https://www.prisma.io/docs/concepts/components/prisma-client/custom-validation