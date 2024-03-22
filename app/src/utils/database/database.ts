import { PrismaClient, PlayerIdentity } from '@prisma/client'

export const database = new PrismaClient().$extends({
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



//awesome post for features: https://github.com/prisma/prisma/issues/7161#issuecomment-1026317110
//custom computed fields: https://www.prisma.io/docs/orm/prisma-client/queries/computed-fields
//custom validation: https://www.prisma.io/docs/concepts/components/prisma-client/custom-validation
// !!! custom models: .findManyByDomain() : https://www.prisma.io/docs/concepts/components/prisma-client/custom-validation