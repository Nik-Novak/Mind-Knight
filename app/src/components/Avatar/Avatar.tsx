"use client";
import {Avatar as MUIAvatar, Menu, MenuItem, SxProps, Theme} from '@mui/material'
import { deepOrange } from '@mui/material/colors'
import { getServerSession } from 'next-auth';
import { SessionProvider, signIn, signOut, useSession } from 'next-auth/react';
import { redirect, usePathname, useRouter } from 'next/navigation';
import Image from 'next/image'

import { ReactNode, useRef, useState } from 'react'
import { provideSession } from '@/utils/hoc/provideSession';
type Props = {
  sx?: SxProps<Theme>,
  isAdmin?:boolean,
  enableActions?:boolean
}

function Avatar({sx, enableActions=false, isAdmin}:Props){
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const avatarRef = useRef<HTMLDivElement>(null);

  // const session = await getServerSession()  //NextAuth server component
  const { data:session } = useSession({
    required: false, 
    // onUnauthenticated(){
    //   redirect(`/login?callbackUrl=${pathname}`);
    // }
  });

  const handleLogin = ()=>{
    setOpen(false);
    signIn();
  }
  const handleLogout = ()=>{
    setOpen(false);
    signOut();
  }

  const actions:ReactNode[] = [];

  if(enableActions){
    if(session){
      if(isAdmin)
        actions.push(<MenuItem key='admin' onClick={()=>router.push('/admin')}>Admin</MenuItem>);
      actions.push(<MenuItem key='logout' onClick={handleLogout}>Logout</MenuItem>);
    }
    else
      actions.push(<MenuItem key='login' onClick={handleLogin}>Login</MenuItem>);
  }

  return (
    <>
      { enableActions && <Menu
          id="basic-menu"
          anchorEl={avatarRef.current}
          open={open}
          onClose={()=>setOpen(false)}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
        {/* <MenuItem onClick={()=>setOpen(false)}>Profile</MenuItem>
        <MenuItem onClick={()=>setOpen(false)}>My account</MenuItem> */}
        {actions}
      </Menu> 
      }
      <MUIAvatar src={session?.user?.image || undefined} sx={{cursor:'pointer', ...sx}} variant="square" onClick={()=>setOpen(true)} ref={avatarRef}>
          { session?.user?.name?.charAt(0).toUpperCase() }
          {/* { session?.user?.name?.split(' ').map(segment=>segment.charAt(0).toUpperCase()).join(' ') } */}
      </MUIAvatar>
    </>
  )
}

export default provideSession(Avatar);