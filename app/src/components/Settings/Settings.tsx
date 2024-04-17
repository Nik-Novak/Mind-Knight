"use client";
import { getClient } from "@/actions/mindnight-session";
import { provideSettings } from "@/utils/hoc/provideSettings";
import { Checkbox, FormControlLabel, Stack, Tooltip } from "@mui/material";
import { ClientSettings } from "@prisma/client";
import { useState } from "react";
import { useSettings } from "../SettingsProvider";

export default function Settings(){
  const {settings, updateSettings} = useSettings();
  return (
    <Stack ml={1}>
      {/* <Tooltip title="Disables the ability to secure">
        <FormControlLabel control={<Checkbox checked={settings.alpha_mode} onChange={(e, checked)=>updateSettings({alpha_mode:checked})} />} label="Alpha Mode" />
      </Tooltip> */}
      <Tooltip title="Hides any information that would reveal roles">
        <FormControlLabel control={<Checkbox checked={settings.streamer_mode} />} onChange={(e, checked)=>updateSettings({streamer_mode:checked})} label="Streamer Mode" />
      </Tooltip>
      <Tooltip title="We miss you brother">
        <FormControlLabel control={<Checkbox checked={settings.josh_mode} />} onChange={(e, checked)=>updateSettings({josh_mode:checked})} label="Josh Mode" />
      </Tooltip>
    </Stack>
  );
}