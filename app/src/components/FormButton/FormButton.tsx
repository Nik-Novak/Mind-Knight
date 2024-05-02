"use client";
import { LoadingButton, LoadingButtonProps } from "@mui/lab";
import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

type Props = LoadingButtonProps & {
  // disableOnSubmit?:boolean;
}

export default function FormButton(props:Props){
  const {pending} = useFormStatus();
  return <LoadingButton type="submit" loading={pending} {...props} />
}