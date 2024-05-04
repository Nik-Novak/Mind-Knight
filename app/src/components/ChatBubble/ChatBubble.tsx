import { chatMessageMiddleware } from "@/utils/functions/chat"
import { Tooltip, TooltipProps, tooltipClasses } from "@mui/material"

type Props = {
  children:JSX.Element,
  placement:TooltipProps['placement'],
  typing?:boolean,
  idle?:boolean,
  chatMsg?:string,
}

export default function ChatBubble({children, placement, typing, idle, chatMsg}: Props){
  const content = typing ? 
      <span style={{fontStyle:'italic', color:'black', fontSize:20}}> ... </span> 
    : idle ?
      <span style={{fontStyle:'italic', color:'black', fontSize:20}}> ZZZ.. </span> 
    : <span style={{display:'flex', alignItems:'center', fontSize:'14px', padding:'5px'}}>{chatMessageMiddleware(chatMsg, undefined)}</span>
  return (
    <Tooltip 
      placement={placement} 
      arrow 
      componentsProps={{
        popper: typing || idle ? {
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
      title={ content } 
      open={!!chatMsg || !!typing || !!idle}
    >
      {children}
    </Tooltip>
  )
}