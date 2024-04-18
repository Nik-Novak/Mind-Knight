"use client";
import {Avatar as MUIAvatar, Menu, MenuItem, SxProps, Theme} from '@mui/material'
import { deepOrange } from '@mui/material/colors'
import { getServerSession } from 'next-auth';
import { SessionProvider, signIn, signOut, useSession } from 'next-auth/react';
import { redirect, usePathname } from 'next/navigation';
import Image from 'next/image'

import { useRef, useState } from 'react'
import { provideSession } from '@/utils/hoc/provideSession';
type Props = {
  sx?: SxProps<Theme>,
  actions?:boolean
}

function Avatar({sx, actions=false}:Props){
  const [open, setOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

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

  return (
    <>
      { actions && <Menu
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
        { session 
          ? <MenuItem onClick={handleLogout}>Logout</MenuItem>
          : <MenuItem onClick={handleLogin}>Login</MenuItem>
        }
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