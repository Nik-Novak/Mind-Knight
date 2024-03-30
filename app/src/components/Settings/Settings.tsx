import { Checkbox, FormControlLabel, Stack, Tooltip } from "@mui/material";


export default function Settings(){
  return (
    <Stack ml={1}>
      <Tooltip title="Disables the ability to secure">
        <FormControlLabel control={<Checkbox />} label="Alpha Mode" />
      </Tooltip>
      <Tooltip title="Hides any information that would reveal your role">
        <FormControlLabel control={<Checkbox />} label="Streamer Mode" />
      </Tooltip>
    </Stack>
  );
}