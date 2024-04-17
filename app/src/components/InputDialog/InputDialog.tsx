import { useLang } from "@/hooks/LangContext";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, TextFieldProps } from "@mui/material";

import { useRef } from "react";

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  text?: string;
  showInput?: boolean;
  inputProps?:TextFieldProps;
  // inputLabel?:string;
  // inputPlaceholder?:string;
  onConfirm?: (input: string) => void;
  onClose?: () => void;
};

export default function ConfirmDialog({ open, title, text, showInput=true, inputProps, onConfirm = () => {}, onClose = () => {} }: ConfirmDialogProps) {
  // const { t } = useLang();
  const dialogInputRef = useRef<HTMLInputElement>();
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column" }}>
        {text && text.split("\n").map((line, i) => (
          <DialogContentText key={i}>{line}</DialogContentText>
        ))}
        {showInput && <TextField autoFocus margin="dense" label={'confirm'/*default*/} placeholder={'confirm'/*default*/} type="text" fullWidth variant="standard" {...inputProps} inputRef={dialogInputRef} />}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            onClose();
          }}
        >
          {'Cancel'}
        </Button>
        <Button onClick={() => onConfirm(dialogInputRef.current?.value || "")}>{'Confirm'}</Button>
      </DialogActions>
    </Dialog>
  );
}
