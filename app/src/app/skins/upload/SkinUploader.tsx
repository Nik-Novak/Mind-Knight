"use client";
import { uploadCustomSkin } from "@/actions/skins";
import FormButton from "@/components/FormButton";
import Notification from "@/components/Notification";
import { useNotificationQueue } from "@/components/NotificationQueue";
import { provideSession } from "@/utils/hoc/provideSession";
import { Box, Checkbox, FormControlLabel, Paper, Slider, Stack, TextField, Typography } from "@mui/material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { FileUploader } from 'react-drag-drop-files';
import agentBadge from './agent_badge.png';
import { recordTraceEvents } from "next/dist/trace";
import { clamp, map } from "@/utils/functions/general";

function toDisplayWidth(normalizedWidth:number, canvas:HTMLCanvasElement ){
  return normalizedWidth * canvas.clientWidth / canvas.width;
}
function toDisplayHeight(normalizedHeight:number, canvas:HTMLCanvasElement ){
  return normalizedHeight * canvas.clientHeight / canvas.height;
}

function SkinUploader(){
  const [agreed1, setAgreed1] = useState(false);
  const [agreed2, setAgreed2] = useState(false);
  const [agreed3, setAgreed3] = useState(false);
  const [isDraggingBadge, setIsDraggingBadge] = useState(false);
  const [badgeCoords, setBadgeCoords] = useState<[number, number]>([14, 20]);
  const [badgeWidth, setBadgeWidth] = useState(3);
  const minBadgeX=7, maxBadgeX=23-badgeWidth, minBadgeY=9, maxBadgeY=44-badgeWidth;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imgBase64, setImgbase64] = useState<string>();
  const imgCanvasRef = useRef<HTMLCanvasElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { pushNotification } = useNotificationQueue();
  const {data:session} = useSession();
  const router = useRouter();

  if(!session)
    return <Typography color={'red'} variant="h2">You must be logged in to upload skins</Typography>

  const onImageLoad = (img:HTMLImageElement, base64Data:string)=>{
    if(img.naturalWidth === 30 && img.naturalHeight === 51){
      const canvas = imgCanvasRef.current!;
      const ctx = canvas.getContext('2d')!;

      // Set canvas dimensions to match image dimensions
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the image on the canvas
      ctx.drawImage(img, 0, 0);

      // Draw a red rectangle with stroke width 1 on the canvas
      ctx.beginPath();
      ctx.lineWidth = 0.5; // Set stroke width to 1
      ctx.rect(8, 10, 14, 35); // (x, y, width, height)
      ctx.strokeStyle = 'red'; // Set stroke color to red
      ctx.stroke(); // Stroke the rectangle
      
      setImgbase64(base64Data);
      pushNotification(<Notification>Image meets size requirements</Notification>)
    }
    else{
      setImgbase64(undefined);
      pushNotification(<Notification severity="error">Image must be 30 pixels wide by 51 pixels tall</Notification>)
    }
  }

  const handleAddImage = (imgFile:File)=>{
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      let base64 = event.target?.result?.toString();
      if(!base64)
        throw Error("Could not parse image");
      img.src = base64;
      img.onload = evt=>onImageLoad(evt.target as HTMLImageElement, base64);
    };
    reader.readAsDataURL(imgFile);
  }
  return (
    <form 
      action={async (data)=>{
        if(!imgBase64)
          throw Error("Missing file.");
        try{
          await uploadCustomSkin(name, description, imgBase64, badgeCoords, badgeWidth);
          pushNotification(<Notification>Successfully Added Skin</Notification>);
          formRef.current?.reset();
          router.refresh();
        } catch(err){
          console.error(err);
          if(err instanceof Error)
          pushNotification(<Notification severity="error">Something went wrong: {err.message}</Notification>);
        }
        finally{
          setAgreed1(false);
          setAgreed2(false);
          setAgreed3(false);
        }
      }}
      ref={formRef}
      style={{display:'flex', flexDirection:'column', alignItems:'center', marginTop: 40}}
    >
      <Paper sx={{display:'flex', flexDirection:'column', padding:5}}>
        <Typography variant="h5">Upload your 30x51 image</Typography>
        <FileUploader
          multiple={false}
          handleChange={handleAddImage}
          name="file"
          types={['JPG', 'PNG']}
        />
        <Stack position='relative'>
          <canvas style={{imageRendering:'pixelated', cursor:isDraggingBadge ? 'grabbing' : 'grab'}} ref={imgCanvasRef}
            onMouseDown={(e)=>{
              setIsDraggingBadge(true);
            }}
            onMouseMove={(e)=>{
              if(!isDraggingBadge) return;
              // const rect = imgCanvasRef.current!.getBoundingClientRect();
              // const x = (e.clientX - rect.left) * rect.width/30;
              // const y = (e.clientY - rect.top) * rect.height/51;
              // console.log('X', x, e.clientX, rect.left);
              // console.log('Y', y, e.clientY, rect.top);
              // setBadgeCoords([clamp(x, 0, 30), clamp(y, 0, 51)]);
              const canvas = imgCanvasRef.current!;
              const rect = canvas.getBoundingClientRect();
              const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
              const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
              const pageXRelativeToCanvas = (e.pageX - rect.left) - scrollLeft;
              const pageYRelativeToCanvas = (e.pageY - rect.top) - scrollTop;

              let normalizedX = map(pageXRelativeToCanvas-toDisplayWidth(badgeWidth, canvas)/2, 0, canvas.clientWidth, 0, canvas.width);
              let normalizedY = map(pageYRelativeToCanvas-toDisplayWidth(badgeWidth, canvas)/2, 0, canvas.clientHeight, 0, canvas.height);

              console.log(normalizedX, normalizedY);
              // console.log(e.pageY, rect.top);
              setBadgeCoords([ clamp(normalizedX, minBadgeX, maxBadgeX), clamp(normalizedY, minBadgeY, maxBadgeY) ]);
            }}
            onMouseUp={(e)=>{
              setIsDraggingBadge(false);
            }}
          />
          {imgBase64 && <>
            <img 
              style={{position:'absolute', userSelect:'none', pointerEvents:'none', left:`calc(100%/${imgCanvasRef.current!.width}*${badgeCoords[0]})`, top:`calc(100%/${imgCanvasRef.current!.height}*${badgeCoords[1]})`}} 
              src={agentBadge.src} 
              width={toDisplayWidth(badgeWidth, imgCanvasRef.current!)}
            /> 
          
            <Typography>Badge Width:</Typography>
            <Slider
              valueLabelDisplay="auto"
              value={badgeWidth}
              min={3}
              max={6}
              onChange={(e,v)=>typeof v === 'number' && setBadgeWidth(v)}
            />
          </>}
        </Stack>
        <Stack spacing={2}>
          <TextField value={name} onChange={(evt)=>{
            const newValue = evt.target.value;
            if(newValue.match(/^(?!.*\s{2})(?:[a-zA-Z0-9]+(?:\s|$))*$/))
              setName(newValue)
          }} label="Skin Name" placeholder="Echo Reed"  />
          <TextField multiline value={description} onChange={(evt)=>{
            const newValue = evt.target.value;
            if(newValue.match(/^(?!.*\s{2})(?:[a-zA-Z0-9\W]+(?:\s|$))*$/))
              setDescription(newValue)
          }} label="Skin Description" placeholder='Meet Asher "Echo" Reed, a lanky figure with a perpetually furrowed brow, his face illuminated only by the glow of his computer screen ...' />
        </Stack>
        <FormControlLabel sx={{mt:5}} control={<Checkbox value={agreed1} onChange={(e, checked)=>setAgreed1(checked)} />} label="I agree to be a decent human and only upload SFW content" />
        <FormControlLabel control={<Checkbox value={agreed2} onChange={(e, checked)=>setAgreed2(checked)} />} label="I understand that upon uploading, I can use my skin but others won't see it until approved" />
        <FormControlLabel control={<Checkbox value={agreed3} onChange={(e, checked)=>setAgreed3(checked)} />} label="I have ensured that my design lies on or within the red boundary" />
        <FormButton sx={{paddingX:'50px'}} variant="contained" className="pixel-corners" disabled={!agreed1 || !agreed2 || !agreed3 || !imgBase64 || !name || !description} >Upload Skin</FormButton>
      </Paper>
    </form>
  )
}

export default provideSession(SkinUploader);