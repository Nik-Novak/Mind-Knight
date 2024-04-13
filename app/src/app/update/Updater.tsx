"use client";
import { updateVersion } from "@/actions/version";
import FormButton from "@/components/FormButton";
import Loading from "./Loading";

export default async function Updater(){
  return (
    <form 
      action={()=>{
        updateVersion();
      }}
    >
      <Loading />
      <FormButton variant="contained" className="pixel-corners" sx={{paddingX:'50px'}}>Confirm Update</FormButton>
    </form>
  );
}