"use client";
import type { GridRowSelectionModel, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { useReducer, useState } from "react";
import { ActionGrid } from "@/components/ActionGrid";
import { useModifyFieldRef, useRenderOptionsRef } from "@/components/ActionGrid/hooks";
import ConfirmDialog from "@/components/InputDialog";
import { SelectedAction } from "@/components/ActionGrid/types";
import { SxProps, Tooltip } from "@mui/material";
import DetailsDialog from "./DetailsDialog";
import { useNotificationQueue } from "../NotificationQueue";
import { LeaderboardPayload } from "@/types/leaderboard";

//1. Create a types.d.ts file in the services directory and create your flattened admin-specific type
type DataType = LeaderboardPayload; //2. change this to the type you want

type GridProps<DataType> = {
  sx?: SxProps,
  records: DataType[],
  fetchRecords?:(model:GridPaginationModel)=>Promise<DataType[]>, 
  isFetchingRecords?:boolean,
  paginationMetadata: PaginationMetadata,
  onSelectionChange?:(records:GridRowSelectionModel)=>void,
  onRecordsChange?:(records:DataType[]|( (currentRecords:DataType[])=>DataType[]) )=>void,
  playerId?:string,
};
export default function DataGrid({ sx, records, fetchRecords, isFetchingRecords, paginationMetadata, onSelectionChange=()=>{}, onRecordsChange=()=>{}, playerId }: GridProps<DataType>) {

  const {pushNotification} = useNotificationQueue();

  const [showDetails, setShowDetails] = useState<DataType | null>(null);

  const inputDialogReducer = (state:React.ComponentProps<typeof ConfirmDialog>, update:Partial<React.ComponentProps<typeof ConfirmDialog>>)=>{
    return {...state, ...update};
  }
  const [inputDialogProps, updateInputDialogProps] = useReducer(inputDialogReducer, {
    open: false,
    title: "",
    text: "",
    showInput: true,
    onConfirm: (input) => {},
    onClose: () => {updateInputDialogProps({open:false})},
  });

  const [selected, setSelected] = useState<GridRowSelectionModel>([]);

  const modifyFieldRef = useModifyFieldRef<DataType>();
  const renderOptionsRef = useRenderOptionsRef();

  const [innerLoading, setInnerLoading] = useState(false);
  const isLoading = isFetchingRecords || innerLoading;

  //4. Set the selected actions that show up at the bottom of the panel when selecting multiple records
  const selectedActions: SelectedAction<DataType>[] = [
    // {
    //   name: "Build Report", // Name of the action (shows up on button)
    //   color: "error", // Color of the button
    //   showIf: (selectedRows) => !!selectedRows.find((r) => r?.offers ), // a function that returns true if the action/button should be displayed
    //   onClick: (selectedRows) => onBuildReport(selectedRows)
    // },
    {
      name: "Stats",
      color: "primary",
      // showIf: (selectedRows) => true,
      onClick: (selectedRows) => {alert('Not yet implemented')}
    },
    // {
    //   name: "Export CSV",
    //   color: "success",
    //   // showIf: (selectedRows) => !selectedRows.find((r) => !r.details),
    //   onClick: (selectedRows) => onExport(selectedRows, 'csv')
    // },
    // {
    //   name: "Export JSON",
    //   color: "success",
    //   // showIf: (selectedRows) => !selectedRows.find((r) => !r.details),
    //   onClick: (selectedRows) => onExport(selectedRows, 'json')
    // },
  ];

  const columns: GridColDef<DataType>[] = [
    //4. Define fields and any actions you want to show for individual records
    { field: "name", headerName: "Name", flex: 0.25, minWidth: 40 },
    { field:"elo", headerName: "Elo", flex: 0.15, minWidth: 40 },
    { field: "playing_since", headerName: "First Game", flex: 0.15, minWidth: 40, 
      valueGetter:(v, row)=>row.games[0].game_found.log_time, 
      renderCell:(params)=><Tooltip title={params.value.toDateString()}>{params.value.toDateString()}</Tooltip>
    }
  ];

  function renderComponent() {
    return (
      <>
      <DetailsDialog title={`Details for ${showDetails?.id}`} data={showDetails} excludeFields={['chat']} onClose={()=>setShowDetails(null)} />
        <ActionGrid<DataType>
          sx={sx}
          records={records}
          setRecords={onRecordsChange}
          selected={selected}
          onSelectionModelChange={(selectionModel)=>{setSelected(selectionModel); onSelectionChange(selectionModel)}}
          columns={columns}
          selectedActions={selectedActions}
          modifyFieldRef={modifyFieldRef}
          renderOptionsRef={renderOptionsRef}
          loading={isLoading}
          pageSizeOptions={[25, 50]}
          recordCount={paginationMetadata.total_items || 0}
          paginationMode="server"
          paginationModel={{page: paginationMetadata.current_page, pageSize: paginationMetadata.items_per_page}}
          onPaginationModelChange={(model, details)=>{
            // console.log(model);
            if(fetchRecords)
              fetchRecords(model);
          }}
        />
        <ConfirmDialog {...inputDialogProps} />
      </>
    );
  }

  return (
    <>
      {renderComponent()}
      {/* <LoadingOverlay open={isLoading} opaque={!innerLoading} /> */}
    </>
  );
}
