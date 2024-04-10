import { GridRenderCellParams } from "@mui/x-data-grid";
import { ReactNode } from "react";
import { GridRow, RenderCellMenuOption } from "./types";
export type RequestThunk<T> = (rows: T[]) => Promise<T | void> | T | void;
// export type UpdateFieldFunc<T extends GridRow> = RequestThunk<T>
export type ModifyFieldRef<T extends GridRow> = {
  current: {
    // updateField:(rowId:T['id'], field:(keyof T), value:any, remoteUpdateFunc?:RequestThunk<T>)=>Promise<T|void> | T|void,
    updateFields: <K extends keyof T>(rowIds: T["id"][], field: K, value: T[K], remoteUpdateFunc?: RequestThunk<T>) => Promise<T | void> | T | void;
    deleteFields: (rowIds: T["id"][], remoteDeleteThunk?: RequestThunk<T>) => Promise<T[] | void> | T[] | void;
  };
};

type InferParameter<T> = T extends (param: infer P) => any ? P : never;

/**
 * Works like a useRef, in that a function is attached in the lower component that then handles the updates automatically.
 * @returns
 */
export function useModifyFieldRef<T extends GridRow>(): ModifyFieldRef<T> {
  return {
    current: {
      // updateField:(rowId:T['id'], field:(keyof T), value:any)=>{throw Error("Update function is not yet attached, wait for initialization of the component it is attached to.")},
      updateFields: (rowIds, field, value) => {
        throw Error("Update function is not yet attached, wait for initialization of the component it is attached to.");
      },
      deleteFields: (rowIds) => {
        throw Error("Delete function is not yet attached, wait for initialization of the component it is attached to.");
      },
    },
  };
}

export type RenderOptionsRef = {
  current: {
    renderCell: (params: GridRenderCellParams<any, string, string>, menuOptions: RenderCellMenuOption[], render?:(params: GridRenderCellParams<any, string, string>)=>React.ReactNode) => ReactNode;
  };
};
/**
 * Works like a useRef, in that a function is attached in the lower component that then handles the updates automatically.
 * @returns
 */
export function useRenderOptionsRef(): RenderOptionsRef {
  return {
    current: {
      renderCell: (params, menuOptions) => {
        throw Error("Update function is not yet attached, wait for initialization of the component it is attached to.");
      },
    },
  };
}
