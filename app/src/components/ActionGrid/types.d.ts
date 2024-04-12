import type mongoose from "mongoose";

type SelectedAction<T> = {
  name: string;
  color: import("@mui/material").ButtonProps["color"];
  showIf?: (selectedRows: T[]) => boolean;
  onClick: (selectedRows: T[]) => void;
};
// let t:SelectedAction; t.color = ''
type GridRow = { id: string|mongoose.Types.ObjectId; [key: string | number]: any };

type RenderCellMenuOption = {
  name: string;
  value: any;
  onClick: () => void;
};
