"use client";
import type { GridRowSelectionModel, GridColDef, GridRenderCellParams, GridValidRowModel, GridPaginationModel } from "@mui/x-data-grid";
import { useReducer, useState } from "react";
import { ActionGrid } from "@/components/ActionGrid";
import { useModifyFieldRef, useRenderOptionsRef } from "@/components/ActionGrid/hooks";
import ConfirmDialog from "@/components/InputDialog";
import { checkPagination } from "@/utils/functions/requests";
import { SelectedAction } from "@/components/ActionGrid/types";
import { Button, SxProps, Tooltip } from "@mui/material";
import DetailsDialog from "./DetailsDialog";
import { LoadingButton } from '@mui/lab'
import { Clip, Game, Prisma } from "@prisma/client";
import { GameMode, PlayerRole } from "@/types/game";
import { coloredText } from "@/utils/functions/jsx";
import { copyToClipboard, getTimeComponents, getTimeString } from "@/utils/functions/general";
import { useNotificationQueue } from "../NotificationQueue";
import Notification from "../Notification";
import Link from "next/link";
import { reportGameIssue, updateGameTitle } from "@/actions/game";
import { useRouter } from "next/navigation";
import { updateClipTitle } from "@/actions/clip";

const DEFAULT_ITEMS_PER_PAGE = 11;

//1. Create a types.d.ts file in the services directory and create your flattened admin-specific type
type DataType = Prisma.ClipGetPayload<{include:{game:true, player:true}}>; //2. change this to the type you want

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
  const router = useRouter();
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
    { field: "id", headerName: "ID/Title", flex: 0.25, minWidth: 40,
      valueGetter: (v, row) => { row.id=='661ff13b56f2cee2049114bf' && console.log('HERE', row.title, row.id); return row.title || row.id },
      renderCell: params => 
        playerId && params.row.player_id === playerId //if we made the clip
            ? renderOptionsRef.current.renderCell(
                params,
                [
                  {
                    name: "Set Title",
                    value: "title",
                    onClick: () =>
                      updateInputDialogProps({
                        open:true,
                        title: `Set the title for ${params.row.id}`,
                        inputProps:{ 
                          label:'New Title',
                          placeholder: 'Noobs Gone Wrong 2',
                        },
                        onConfirm:async (newTitle)=>{
                          await updateClipTitle(params.row.id, newTitle); 
                          params.row.title = newTitle;
                          pushNotification(<Notification>Set title for {params.row.id}</Notification>)
                          updateInputDialogProps({open:false})
                        },
                        onClose: () => {updateInputDialogProps({open:false})},
                      })
                  },
                ]
              )
            : params.value
     },
    { field:"gamemode", headerName: "Mode", flex: 0.15, minWidth: 40, 
      valueGetter:(v, row)=>GameMode[row.game.game_found.Options.GameMode],
    },
    { field:"length", headerName: "Length", flex: 0.15, minWidth: 40, 
      valueGetter:(v, row)=>getTimeString(getTimeComponents(row.offset_start, row.offset_end)),
    },
    // { field: "by", headerName: "By", flex: 0.15, minWidth: 40, 
    //   valueGetter:(v, row)=>row.player.name, 
    //   renderCell:(params)=>params.row.player_id === playerId ? coloredText(params.value, '#0000EE') : params.value
    // },
    { field: "players", headerName: "Players", flex: 0.35, minWidth: 40,
      valueGetter:(v, row)=>{
        return row.game.game_end?.PlayerIdentities.map(p=>p.Nickname);
      },
      renderCell: (params)=><Tooltip title={Array.isArray(params.value) ? params.value.join('|') : 'Unknown'}><span>{Array.isArray(params.value) ? params.value.join('|') : 'Unknown'}</span></Tooltip>
    },
    { field: "created_at", headerName: "Date", flex: 0.15, minWidth: 40,
      // valueGetter:(v, row)=>row.game_found.log_time,
      renderCell: (params)=><Tooltip title={params.value.toString()}>{params.value?.toDateString()}</Tooltip>,
      // sortComparator:(v1, v2, cellParams1, cellParams2)=> {
      //   cellParams1.
      // }
    },
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
                  let link = `${window.location.protocol}//${window.location.host}/clip?id=${params.row.id}`;
                  await copyToClipboard(link);
                  pushNotification(<Notification>Copied Share Link to Clipboard!</Notification>);
                }
            },
            {
              name: "Details",
              value: "details",
              onClick: () =>
                setShowDetails(params.row)
            },
            {
              name: "Original Game",
              value: "original_game",
              onClick: () =>
                router.push(`/game?id=${params.row.game_id}`)
            }
          ], 
          (params)=><Link href={`/clip?id=${params.row.id}`}><Button variant="contained" className="pixel-corners-small">View</Button></Link>
        )
    },
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
