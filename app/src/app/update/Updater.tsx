"use client";
import { updateVersion } from "@/actions/version";
import FormButton from "@/components/FormButton";

export default async function Updater(){
  return (
    <form 
      action={()=>{
        updateVersion();
      }}
    >
      <FormButton variant="contained" className="pixel-corners" sx={{paddingX:'50px'}}>Confirm Update</FormButton>
    </form>
  );
}