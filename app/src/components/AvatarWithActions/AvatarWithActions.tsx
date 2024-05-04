"use client";
import { grey } from "@mui/material/colors";
import Avatar from "../Avatar/Avatar";
import { signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import InputDialog from "../InputDialog";
import { reportBug } from "@/actions/bug";
import { useNotificationQueue } from "../NotificationQueue";
import Notification from "../Notification";

type Props = {
  isAdmin?:boolean
}

export default function AvatarWithActions({isAdmin}:Props){
  const router = useRouter();
  const {pushNotification} = useNotificationQueue();
  const [isBugDialogOpen, setIsBugDialogOpen] = useState(false);
  return (
    <>
      <Avatar sx={{bgcolor: grey[800], position: 'fixed', top:10, right:10}} isAdmin={isAdmin}
        actions={[
          {
            requiredContexts:['loggedin', 'admin'],
            name: 'Admin',
            callback:()=>router.push('/admin')
          },
          {
            name: 'Report Bug',
            callback:()=>setIsBugDialogOpen(true)
          },
          {
            requiredContexts:['loggedout'],
            name: 'Login',
            callback:()=>signIn()
          },
          {
            requiredContexts:['loggedin'],
            name: 'Logout',
            callback:()=>signOut()
          },
        ]}
      />
      <InputDialog 
        open={isBugDialogOpen} 
        title="Report a Bug" 
        text="Describe the bug in as much detail as you can." 
        inputProps={{multiline:true, label:"Description", placeholder:'This bug occurs when I load into a mainframe game...'}} 
        onConfirm={async (text)=>{
          let bug = await reportBug(text); 
          setIsBugDialogOpen(false);
          pushNotification(<Notification>Reported bug with id: {bug.name}. Please post in discord.</Notification>);
        }} 
        onClose={()=>setIsBugDialogOpen(false)} 
      />
    </>
  )
}