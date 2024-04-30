import { CustomSkin, Prisma } from "@prisma/client"

export type SkinSrc = {
  src:string,
  name: string,
  custom_skin?: Prisma.CustomSkinGetPayload<{select:{
    approved:true,
    base64_data:true,
    created_at:true,
    description:true,
    id:true,
    name:true,
    owner:true,
    owner_id:true,
    unlocked_game_ids:true,
    updated_at:true,
    unlocked_games:{
      omit:{
        $addChatMessage:true,
        $addChatUpdate:true,
        $addConnectionUpdate:true,
        $addIdleStatusUpdate:true,
        $addVoteMade:true,
        $endGame:true,
        $endMission:true,
        $endProposal:true,
        $endVote:true,
        $spawnPlayer:true,
        $startGame:true,
        $startMission:true,
        $startProposal:true,
        $startVote:true,
        $syncRemote:true,
        $updateProposalSelection:true,
        chat:true,
        context:true,
        game_end:true,
        game_players:true,
        game_start:true,
        missions:true
      }
    }
  }}>
  // owner?:string,
  // stolen?:string,
  // created_at?:Date,
}