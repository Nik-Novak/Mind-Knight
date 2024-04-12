import { LoadingButton, LoadingButtonProps } from "@mui/lab";
import { useFormStatus } from "react-dom";


export default function FormButton(props:LoadingButtonProps){
  const {pending} = useFormStatus();
  return <LoadingButton type="submit" loading={pending} {...props} />
}