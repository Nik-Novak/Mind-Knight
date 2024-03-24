import { PrismaClient, PlayerIdentity, Prisma, Game } from '@prisma/client'
// let modelnames = Prisma.dmmf.datamodel.models.map(m=>m.name); Value `in` modelnames

type NonNull<T> = Exclude<T, null | undefined>;

const prismaClientSingleton= ()=>{
  let prisma = new PrismaClient();
  return prisma.$extends({
    query:{
      $allOperations({ model, operation, args, query }) {
        /* your custom logic for modifying all Prisma Client operations here */
        return query(args)
      }
    },
    model: {
      $allModels:{
        polish<T>(
          this:T, 
          valueToPolish:Prisma.Args<T, 'create'>['data'], //corresponding model input type
          schemaName = Prisma.getExtensionContext(this).$name
        ) :NonNull< Prisma.Result<T, undefined, 'findFirst'> >/* corresponding model return type */ {
          // let t:Prisma.Result<T, undefined, 'findFirst'>;
          /* TODO: explore Prisma.TypeMap */
          let ctx = Prisma.getExtensionContext(this);
          if(Array.isArray(valueToPolish))//@ts-expect-error
            return valueToPolish.map(v=>this.polish(v, schemaName)) // handle arrays of schema values
          if(typeof valueToPolish !== 'object' || valueToPolish === null)
            return valueToPolish;
          let schemaReference = Prisma.dmmf.datamodel.models.find(m=>m.name==schemaName) || Prisma.dmmf.datamodel.types.find(t=>t.name==schemaName);
          // console.log('SCHEMA_NAME', schemaName);
          // console.log('SCHEMA', schemaReference); //DEBUG
          let polishedData = {} as NonNull< Prisma.Result<T, undefined, 'findFirst'> >;
          schemaReference?.fields.forEach(field=>{
            // console.log('FIELD', field); //DEBUG
            let value = valueToPolish[field.name];
            if(value==undefined) // SOURCE FROM DBNAME such as __v in the case that v doesnt exist
              value=(field.dbName && valueToPolish[field.dbName])
            // console.log('value', value); //DEBUG
            if(field.kind === 'object') {
              //@ts-expect-error
              value = this.polish(value, field.type); //Prisma.getExtensionContext(this) this is helpful too, in case of differing order of definition
            }
            //@ts-expect-error
            polishedData[field.name] = value;
          });
          // console.log('OG',modelName,Object.keys(valueToPolish)); //DEBUG
          // console.log('POLISHED', modelName, Object.keys(polishedData)); //DEBUG
          return polishedData;
        }
      },
      player: {
        async findOrCreate(playerIdentity:PlayerIdentity){
          return database.player.create({data:{
            level: playerIdentity.Level,
            steam_id: playerIdentity.Steamid,
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