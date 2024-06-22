"use client";
import { Avatar as MUIAvatar, Menu, MenuItem, SxProps, Theme } from '@mui/material'
import { useSession } from 'next-auth/react';

import { ReactNode, useRef, useState } from 'react'
import { provideSession } from '@/utils/hoc/provideSession';
import ContextMenu, { MenuAction } from '../ContextMenu';

type Props = {
  sx?: SxProps<Theme>,
  elo?:number,
  isAdmin?:boolean,
  actions?: MenuAction[]
}

export default function Avatar({sx, elo, actions, isAdmin}:Props){
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  // const session = await getServerSession()  //NextAuth server component
  const { data:session } = useSession({
    required: false, 
    // onUnauthenticated(){
    //   redirect(`/login?callbackUrl=${pathname}`);
    // }
  });

  return (
    <>
      <ContextMenu open={isContextMenuOpen} actions={actions} anchorEl={avatarRef.current} isAdmin={isAdmin} session={session} onClose={()=>setIsContextMenuOpen(false)} />
      {/* <Badge  badgeContent={elo?.toFixed(0)} max={9999} color='warning' anchorOrigin={{horizontal:'left', vertical:'bottom'}}> */}
      <MUIAvatar src={session?.user?.image || undefined} sx={{cursor:'pointer', ...sx}} variant="square" onClick={()=>setIsContextMenuOpen(true)} ref={avatarRef}>
        { session?.user?.name?.charAt(0).toUpperCase() }
        {/* { session?.user?.name?.split(' ').map(segment=>segment.charAt(0).toUpperCase()).join(' ') } */}
      </MUIAvatar>
      {/* </Badge> */}
    </>
  )
}