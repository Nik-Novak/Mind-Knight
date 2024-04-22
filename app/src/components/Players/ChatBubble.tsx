import { chatMessageMiddleware } from "@/utils/functions/chat"
import { Tooltip, TooltipProps, tooltipClasses } from "@mui/material"

type Props = {
  children:JSX.Element,
  placement:TooltipProps['placement'],
  typing?:boolean,
  chatMsg?:string,
}

export default function ChatBubble({children, placement, typing, chatMsg}: Props){
  return (
    <Tooltip 
      placement={placement} 
      arrow 
      componentsProps={{
        popper: typing ? {
          sx: {
            [`& .${tooltipClasses.arrow}`]: {
              color: (theme) => 'white'
            },
            [`& .${tooltipClasses.tooltip}`]: {
              backgroundColor: 'white'
            }
          }
        } : {
          sx: {
            maxWidth:'314px'
          }
        }
      }}
      title={typing ? <span style={{fontStyle:'italic', color:'black', fontSize:20}}> ... </span> : <span style={{display:'flex', alignItems:'center', fontSize:'14px', padding:'5px'}}>{chatMessageMiddleware(chatMsg, undefined)}</span> } 
      open={!!chatMsg || !!typing}
    >
      {children}
    </Tooltip>
  )
}