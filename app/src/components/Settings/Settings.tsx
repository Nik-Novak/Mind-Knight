"use client";
import { getClient } from "@/actions/mindnight-session";
import { provideSettings } from "@/utils/hoc/provideSettings";
import { Checkbox, FormControlLabel, Stack, Tooltip } from "@mui/material";
import { ClientSettings } from "@prisma/client";
import { useState } from "react";
import { useSettings } from "../SettingsProvider";

function Settings(){
  const {settings, updateSettings} = useSettings();
  return (
    <Stack ml={1}>
      <Tooltip title="Disables the ability to secure">
        <FormControlLabel control={<Checkbox checked={settings.alpha_mode} onChange={(e, checked)=>updateSettings({alpha_mode:checked})} />} label="Alpha Mode" />
      </Tooltip>
      <Tooltip title="Hides any information that would reveal your role">
        <FormControlLabel control={<Checkbox checked={settings.streamer_mode} />} onChange={(e, checked)=>updateSettings({streamer_mode:checked})} label="Streamer Mode" />
      </Tooltip>
    </Stack>
  );
}

export default provideSettings(Settings)