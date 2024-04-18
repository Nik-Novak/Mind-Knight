"use client";
import { uploadCustomSkin } from "@/actions/skins";
import FormButton from "@/components/FormButton";
import Notification from "@/components/Notification";
import { useNotificationQueue } from "@/components/NotificationQueue";
import { provideSession } from "@/utils/hoc/provideSession";
import { Checkbox, FormControlLabel, Paper, Stack, TextField, Typography } from "@mui/material";
import { useSession } from "next-auth/react";
import { useRef, useState } from "react";
import { FileUploader } from 'react-drag-drop-files';

function SkinUploader(){
  const [agreed1, setAgreed1] = useState(false);
  const [agreed2, setAgreed2] = useState(false);
  const [agreed3, setAgreed3] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imgBase64, setImgbase64] = useState<string>();
  const imgCanvasRef = useRef<HTMLCanvasElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { pushNotification } = useNotificationQueue();
  const {data:session} = useSession();

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
          await uploadCustomSkin(name, description, imgBase64);
          pushNotification(<Notification>Successfully Added Skin</Notification>);
          formRef.current?.reset();
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
        <canvas style={{imageRendering:'pixelated'}} ref={imgCanvasRef} />
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