"use client";
import {Badge, Avatar as MUIAvatar, Menu, MenuItem, SxProps, Theme} from '@mui/material'
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { ReactNode, useRef, useState } from 'react'
import { provideSession } from '@/utils/hoc/provideSession';
type ActionContext = 'admin'|'loggedin'|'loggedout';
type Action = {
  requiredContexts?:ActionContext[],
  name: string,
  callback: ()=>void|Promise<void>
}
type Props = {
  sx?: SxProps<Theme>,
  elo?:number,
  isAdmin?:boolean,
  actions?: Action[]
}

function Avatar({sx, elo, actions, isAdmin}:Props){
  const [open, setOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  // const session = await getServerSession()  //NextAuth server component
  const { data:session } = useSession({
    required: false, 
    // onUnauthenticated(){
    //   redirect(`/login?callbackUrl=${pathname}`);
    // }
  });

  const renderActions:ReactNode[] = [];

  if(actions?.length){
    for( let action of actions ){
      const isContextValid = !action.requiredContexts || action.requiredContexts.reduce((isValid, currentContext)=>{
        switch(currentContext){
          case 'admin': return isValid && !!isAdmin;
          case 'loggedin': return isValid && !!session;
          case 'loggedout': return isValid && !session;
        }
      }, true);
      if(isContextValid){
        renderActions.push(<MenuItem key={action.name} onClick={()=>{setOpen(false); action.callback()}}>{action.name}</MenuItem>)
      }
    }
  }

  return (
    <>
      { actions?.length && <Menu
          id="basic-menu"
          anchorEl={avatarRef.current}
          open={open}
          onClose={()=>setOpen(false)}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
        {renderActions}
      </Menu> 
      }
      {/* <Badge  badgeContent={elo?.toFixed(0)} max={9999} color='warning' anchorOrigin={{horizontal:'left', vertical:'bottom'}}> */}
        <MUIAvatar src={session?.user?.image || undefined} sx={{cursor:'pointer', ...sx}} variant="square" onClick={()=>setOpen(true)} ref={avatarRef}>
            { session?.user?.name?.charAt(0).toUpperCase() }
            {/* { session?.user?.name?.split(' ').map(segment=>segment.charAt(0).toUpperCase()).join(' ') } */}
        </MUIAvatar>
      {/* </Badge> */}
    </>
  )
}

export default provideSession(Avatar);