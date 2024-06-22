"use client";
import { provideSession } from "@/utils/hoc/provideSession";
import { Menu, MenuItem, PopoverVirtualElement, SxProps, Theme } from "@mui/material";
import { useSession } from "next-auth/react";

import { ReactNode, useState } from "react";

export type MenuActionContext = 'admin'|'loggedin'|'loggedout'|'owner';
export type MenuAction = {
  requiredContexts?:MenuActionContext[],
  name: string,
  callback: ()=>void|Promise<void>
}

type Props = {
  sx?:SxProps<Theme>,
  actions:MenuAction[]|undefined;
  anchorEl: Element | (() => Element) | PopoverVirtualElement | (() => PopoverVirtualElement) | null | undefined;
  isAdmin?:boolean,
  ownerId?:string,
  onClose:(event: {}, reason: "backdropClick" | "escapeKeyDown" | "menuItemClick")=>void
} & ({
  open:boolean;
  menuOpenIcon?: undefined
} | 
{
  open?:undefined;
  menuOpenIcon: ReactNode
}
)

export default function ContextMenu({ sx, open, actions, anchorEl, isAdmin, ownerId, onClose=()=>{}}:Props){
  const renderActions:ReactNode[] = [];
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const {data:session} = useSession();

  const handleClose = (...args:Parameters<typeof onClose>)=>{
    if(open === undefined)
      setUncontrolledOpen(false);
    onClose(...args);
  }

  if(actions?.length){
    for( let action of actions ){
      const isContextValid = !action.requiredContexts || action.requiredContexts.reduce((isValid, currentContext)=>{
        switch(currentContext){
          case 'admin': return isValid && !!isAdmin;
          case 'loggedin': return isValid && !!session;
          case 'loggedout': return isValid && !session;
          case 'owner': return isValid && session?.user.player_id === ownerId
        }
      }, true);
      if(isContextValid){
        renderActions.push(<MenuItem key={action.name} onClick={(e)=>{onClose(e, 'menuItemClick'); action.callback()}}>{action.name}</MenuItem>)
      }
    }
  }
  return (
    <>
      { renderActions?.length && <Menu
          sx={sx}
          id="basic-menu"
          anchorEl={anchorEl}
          open={open !== undefined ? open : uncontrolledOpen}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
        {renderActions}
      </Menu> 
      }
    </>
  )
}