"use client";
import styles from "./page.module.css";
import { Button, Stack, Typography } from "@mui/material";
import SkinUploader from "./SkinUploader";
import Background from "@/components/Background";
import Image from "next/image";
import Link from "next/link";

export default function UploadPage() {
  
  return (
    <>
      <Background id='content' className={styles.main}>
        <Typography variant="h2">Skin Uploader</Typography>
        <Stack sx={{mt:5}} alignItems='center'>
          <Typography variant="h4">This page allows you to upload a custom skin to be used.</Typography>
          <Typography variant="h4">The skin file must be a jpg or png file.</Typography>
          <img style={{imageRendering:'pixelated'}} src='/img/skins/_skin_upload_template.png' alt="skin upload template" width={120} height={204} />
          <a href="/img/skins/_skin_upload_template.png" download='_skin_upload_template.png'><Button className="pixel-corners" variant="contained">Download Sample</Button></a>
          <Typography sx={{mt:5}} variant="h4">Here is a sample. Your design must lie ON or WITHIN the red outline.</Typography>
        </Stack>
        
        <Stack alignItems='center'>
          <Typography variant="h4">Once uploaded, it will be immediately useable by you.</Typography>
          <Typography variant="h4">However, it will need to be approved for others to see it.</Typography>
        </Stack>
        <SkinUploader />
      </Background>
    </>
  );
}