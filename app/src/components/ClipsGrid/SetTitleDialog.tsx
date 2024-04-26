import { useLang } from "@/hooks/LangContext";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";

import { useRef } from "react";

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  text: string;
  showInput?: boolean;
  onConfirm: (input: string) => void;
  onClose: () => void;
};

export default function SetTitleDialog({ open, title, text, showInput, onConfirm = () => {}, onClose = () => {} }: ConfirmDialogProps) {
  // const { t } = useLang();
  const dialogInputRef = useRef<HTMLInputElement>();
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column" }}>
        {text.split("\n").map((line, i) => (
          <DialogContentText key={i}>{line}</DialogContentText>
        ))}
        <TextField autoFocus margin="dense" label={'Confirm'} type="text" fullWidth variant="standard" inputRef={dialogInputRef} />
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
