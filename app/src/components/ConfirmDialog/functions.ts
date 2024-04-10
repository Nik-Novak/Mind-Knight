// export function userConfirmDialog(timeout=60000, onDialogOpen=()=>{}, onDialogClose=()=>{}) {
//   return new Promise<string>((resolve, reject)=>{
//     let timer = new Timer(()=>{onDialogClose(); reject(Error("Confirmation timed out"));}, timeout);
//     timer.addInterval(()=>{})
//     onDialogOpen();
//   });
// }

import { Timer } from "@util/Timer";
import { Dispatch, SetStateAction } from "react";
import { ConfirmDialogProps } from "./ConfirmDialog";

const setDialogOpen = (isOpen: boolean, setDialogProps: Dispatch<SetStateAction<ConfirmDialogProps>>) => {
  setDialogProps((dialogProps) => ({ ...dialogProps, open: isOpen }));
};
export function userConfirmDialog(setDialogProps: Dispatch<SetStateAction<ConfirmDialogProps>>, timeout = 60000) {
  return new Promise<string>((resolve, reject) => {
    let timer = new Timer(() => {
      setDialogOpen(false, setDialogProps);
      reject(Error("Confirmation timed out"));
    }, timeout);
    timer.addInterval(
      () =>
        setDialogProps((p) => ({
          ...p,
          text: `Please check your email and enter the confirmation token.\n${Math.round(timer.getTimeRemaining() / 1000)} seconds left.`,
        })),
      5000,
      { initialRun: true }
    );
    setDialogProps({
      open: true,
      title: "Confirm",
      text: `Please check your email and enter the confirmation token.\n${timeout / 1000} seconds left.`,
      showInput: true,
      onConfirm: (value) => {
        setDialogOpen(false, setDialogProps);
        timer.stop();
        resolve(value);
      },
      onClose: () => {
        setDialogOpen(false, setDialogProps);
        timer.stop();
        reject(Error("Cancelled"));
      },
    });
    timer.start();
  });
}
