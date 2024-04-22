type AsyncThunk<R> = ()=>R|Promise<R>;
export async function attempt<R>(thunk:AsyncThunk<R>, game_id:string, context?:string){
    try{
        return await thunk();
      }catch(err:unknown){
        if(err instanceof Error)
          // await database.rawGame.create({
          //   data:{
          //     data: LogTailer.readLog(),
          //     upload_reason:'Error',
          //     error: err.message + '\n' + err.stack,
          //     context,
          //     game_id
          //   }
          // })
        console.error(err);
      }
}