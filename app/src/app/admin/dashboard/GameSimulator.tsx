"use client";
import { useState } from "react";
import { FileUploader } from 'react-drag-drop-files';
import { Box, Button, Checkbox, FormControlLabel, Slider, Stack, SxProps, Theme, Typography } from "@mui/material";
import FormButton from "@/components/FormButton";
import { simulate } from "@/actions/game";
import { useRouter } from "next/navigation";
type Props = {
  sx?: SxProps<Theme>
}
export default function GameSimulator({sx}:Props){
  const [log, setLog] = useState<File>()
  const router = useRouter();

  const handleChange = (log:File) => {
    setLog(log);
  }

  return (
      <form action={async (data)=>{
        await simulate(data);
        router.replace('/game');
      }}>
        <Stack sx={{mt:3}} spacing={2}>
          <FileUploader
            multiple={false}
            handleChange={handleChange}
            name="file"
            types={['LOG']}
          />
          {log && <Stack>
            <Typography >Time between lines (ms)</Typography>
            <Slider name="time-between-lines-ms" min={1} max={1000} defaultValue={100} valueLabelDisplay="auto" />
          </Stack> }
          {log && <FormControlLabel control={<Checkbox name="start-at-gamefound" defaultChecked />} label="Start at GameFound" />}
          {log && <FormButton variant="contained" className="pixel-corners">Simulate</FormButton>}
        </Stack>
      </form>
  )
  //   <Box sx={{border: '5px dashed grey', borderRadius:2, ...sx}}>
  // </Box>
}