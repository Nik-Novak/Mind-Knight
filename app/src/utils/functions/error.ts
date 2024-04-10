import { database } from "../../../prisma/database";
import LogReader from "../classes/LogReader";

type AsyncThunk<R> = ()=>R|Promise<R>;
export async function attempt<R>(thunk:AsyncThunk<R>, game_id:string){
    try{
        return await thunk();
      }catch(err:unknown){
        if(err instanceof Error)
          database.rawGame.create({
            data:{
              data: LogReader.readLog(),
              upload_reason:'Error',
              error: err.message + '\n' + err.stack,
              game_id
            }
          })
        console.error(err);
      }
}