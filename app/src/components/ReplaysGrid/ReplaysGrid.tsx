"use client";
import type { GridRowSelectionModel, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useState } from "react";
import { ActionGrid } from "@/components/ActionGrid";
import { useModifyFieldRef, useRenderOptionsRef } from "@/components/ActionGrid/hooks";
import ConfirmDialog from "@/components/ConfirmDialog";
import { checkPagination } from "@/utils/functions/requests";
import { SelectedAction } from "@/components/ActionGrid/types";
import { Button, SxProps } from "@mui/material";
import DetailsDialog from "./DetailsDialog";
import { LoadingButton } from '@mui/lab'
import { Game } from "@prisma/client";
import { PlayerRole } from "@/types/game";
import { coloredText } from "@/utils/functions/jsx";
import { copyToClipboard } from "@/utils/functions/general";
import { useNotificationQueue } from "../NotificationQueue";
import Notification from "../Notification";
import Link from "next/link";

const DEFAULT_ITEMS_PER_PAGE = 11;

//1. Create a types.d.ts file in the services directory and create your flattened admin-specific type
type DataType = Game; //2. change this to the type you want

type GridProps = {
  sx?: SxProps,
  records: DataType[],
  fetchRecords?:()=>Promise<DataType[]>, 
  isFetchingRecords?:boolean, 
  fetchRecordsError?:string,
  onSelectionChange?:(records:GridRowSelectionModel)=>void
  onRecordsChange?:(records:DataType[]|( (currentRecords:DataType[])=>DataType[]) )=>void
};
export default function DataGrid({ sx, records, fetchRecords, isFetchingRecords, fetchRecordsError, onSelectionChange=()=>{}, onRecordsChange=()=>{} }: GridProps) {

  const {pushNotification} = useNotificationQueue();

  const [showDetails, setShowDetails] = useState<DataType | null>(null);

  const [paginationMetadata, setPaginationMetadata] = useState<PaginationMetadata>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [previousPage, nextPage] = checkPagination(paginationMetadata);

  const [dialogProps, setDialogProps] = useState<React.ComponentProps<typeof ConfirmDialog>>({
    open: false,
    title: "",
    text: "",
    showInput: true,
    onConfirm: (input) => {},
    onClose: () => {setDialogProps(current=>({...current, open:false}))},
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
      name: "Share",
      color: "primary",
      // showIf: (selectedRows) => true,
      onClick: (selectedRows) => {console.log('SHARE')}
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

  const columns: GridColDef[] = [
    //4. Define fields and any actions you want to show for individual records
    { field: "id", headerName: "ID", flex: 0.25, minWidth: 40 },
    { field: "team", headerName: "Team", flex: 0.15, minWidth: 40, renderCell:(params)=>{
      let row = params.row as DataType;
      return row.game_found.GuyRole === PlayerRole.agent ? coloredText('agents', '#25A165') : coloredText('hackers', '#952C30');
    } },
    { field: "result", headerName: "Result", flex: 0.15, minWidth: 40, renderCell:(params)=>{
      let row = params.row as DataType;
      if(!row.game_end)
        return "Unfinished";
      return row.game_end.Hacked && row.game_found.GuyRole === PlayerRole.hacker || !row.game_end.Hacked && row.game_found.GuyRole === PlayerRole.agent ? coloredText('Won', '#25A165') : coloredText('Lost', '#952C30');
    } },
    { field: "created_at", headerName: "Date", flex: 0.5, minWidth: 40 },
    { field: "actions", headerName: "Actions", flex: 0.15, minWidth: 120,
      renderCell: (params: GridRenderCellParams<DataType>) =>
        renderOptionsRef.current.renderCell(
          params, 
          [
            {
              name: "Share",
              value: "share",
              onClick: async () =>
                {
                  await copyToClipboard(params.row.id);
                  pushNotification(<Notification>Copied GameID to Clipboard!</Notification>);
                }
            },
            {
              name: "Details",
              value: "details",
              onClick: () =>
                setShowDetails(params.row)
            },
          ], 
          (params)=><Link href={`/game?id=${params.row.id}`}><Button variant="contained">Play</Button></Link>
        )
    },
  ];

  function renderComponent() {
    return (
      <>
      <DetailsDialog title={`Details for ${showDetails?.id}`} data={showDetails} onClose={()=>setShowDetails(null)} />
        {/* <Modal
          open={!!showDetails}
          onClose={()=>setShowDetails(null)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          {<p>{showDetails ? JSON.stringify(showDetails) : ''}</p>}
        </Modal> */}
        <ActionGrid<DataType>
          sx={sx}
          records={records}
          setRecords={onRecordsChange}
          selected={selected}
          onSelectionModelChange={(selectionModel)=>{setSelected(selectionModel); onSelectionChange(selectionModel)}}
          columns={columns}
          selectedActions={selectedActions}
          // onInfo={onInfo}
          // onError={onError}
          modifyFieldRef={modifyFieldRef}
          renderOptionsRef={renderOptionsRef}
          previousPage={previousPage}
          nextPage={nextPage}
          setCurrentPage={setCurrentPage}
        />
        <ConfirmDialog {...dialogProps} />
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
