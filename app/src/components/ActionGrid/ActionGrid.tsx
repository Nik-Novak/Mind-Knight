import Styles from "./actiongrid.module.css";
import { DataGrid, GridCallbackDetails, GridFooter } from "@mui/x-data-grid";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import type { GridSortModel, GridRowSelectionModel, GridColDef, GridRenderCellParams, GridTreeNodeWithRender, GridValidRowModel, GridFeatureMode, GridPaginationModel } from "@mui/x-data-grid";
import { Dispatch, MouseEventHandler, SetStateAction, SyntheticEvent, useEffect, useState } from "react";
import _, { partition } from "lodash";
import IconButton from "@mui/material/IconButton";
import { Button, Container, Menu, MenuItem, SxProps } from "@mui/material";
import { ModifyFieldRef, RenderOptionsRef, RequestThunk } from "./hooks";
import { RenderCellMenuOption, SelectedAction } from "./types";

interface ActionMenuOption {
  name: string;
  onClick: MouseEventHandler;
}

const ITEM_HEIGHT = 48;

type ActionGridProps<T extends GridValidRowModel> = {
  sx?: SxProps,
  records: T[];
  setRecords: Dispatch<SetStateAction<T[]>>;
  selected: GridRowSelectionModel;
  onSelectionModelChange?: ((selectionModel: GridRowSelectionModel, details: GridCallbackDetails<any>) => void) | undefined;
  columns: GridColDef[];
  selectedActions?: SelectedAction<T>[];
  modifyFieldRef: ModifyFieldRef<T>;
  renderOptionsRef: RenderOptionsRef;
  loading?: boolean;
  pageSizeOptions?:readonly (number | {value: number;label: string;})[] | undefined
  recordCount?:number;
  paginationMode?: GridFeatureMode;
  paginationModel?: GridPaginationModel;
  onPaginationModelChange?: ((model: GridPaginationModel, details: GridCallbackDetails<any>) => void);
};
export default function ActionGrid<T extends GridValidRowModel>({
  sx,
  records,
  setRecords,
  selected,
  onSelectionModelChange = () => {},
  columns,
  selectedActions = [],
  modifyFieldRef,
  renderOptionsRef,
  loading,
  pageSizeOptions=[25, 50, 100],
  recordCount,
  paginationMode,
  paginationModel,
  onPaginationModelChange
}: ActionGridProps<T>) {
  const [sortModel, setSortModel] = useState<GridSortModel>([
    /*{field:'searchMisses', sort:'desc'}*/
  ]);
  // const [selected, setSelected] = useState<GridSelectionModel>([]);

  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<HTMLElement | null>(null);
  const [actionMenuOptions, setActionMenuOptions] = useState<ActionMenuOption[]>([]);

  // const [infoNotice, setInfoNotice] = useState('');
  // const [error, setError] = useState('');

  //assign updateField to modifyFieldRef so it can be called from higher up
  useEffect(() => {
    if (!modifyFieldRef) return;
    modifyFieldRef.current.updateFields = async function (rowIds, field, value, remoteUpdateThunk?: RequestThunk<T>) {
      let selectedRecords = records.filter((record) => rowIds.includes(record.id));
      if (!selectedRecords.length) throw Error(`Records with ids ${rowIds} not found`);
      try {
        remoteUpdateThunk && (await remoteUpdateThunk(selectedRecords));
        // updateRecord && await updateRecord({...record, [field]: value}); //TODO old update
        setRecords((records) =>
          records.map((record) => {
            if (rowIds.includes(record.id)) return { ...record, [field]: value };
            return record;
          })
        );
        // onInfo(`Successfully updated ${String(field)} to ${value} for records ${rowIds.join(",")}`);
      } catch (err: any) {
        console.error(err);
        throw err;
        // onError(err.message || "An error occurred");
      }
    } as ModifyFieldRef<T>["current"]["updateFields"];
  }, [modifyFieldRef?.current?.updateFields, records]);

  // Assign deleteFields to modifyFieldRef so it can be called from higher up
  useEffect(() => {
    if (!modifyFieldRef) return;
    modifyFieldRef.current.deleteFields = async function (rowIds, remoteDeleteThunk) {
      try {
        let [rowsToDelete, remaining] = partition(records, (r) => rowIds.includes(r.id));
        remoteDeleteThunk && (await remoteDeleteThunk(rowsToDelete));
        // let newRecords = records.filter(record => !rowIds.includes(record.id));
        setRecords(remaining);
        // onInfo(`Successfully deleted records ${rowIds.join(", ")}`);
      } catch (err: any) {
        console.error(err);
        throw err;
        // onError(err.message || "An error occurred");
      }
    } as ModifyFieldRef<T>["current"]["deleteFields"];
  }, [modifyFieldRef?.current?.deleteFields, records]);

  //assign renderCell to renderOptionsRef so it can be called from higher up but managed from within
  useEffect(() => {
    if (!renderOptionsRef) return;
    renderOptionsRef.current.renderCell = (params: GridRenderCellParams<T, string>, options, render) => {
      let filteredMenuOptions = options.filter((opt) => opt.value != params.value);
      if (!filteredMenuOptions.length) return null;
      // if(params.field==='admin_forced_logout') //great debugging, leave here
      //   console.log(params.field, stringValue, typeof stringValue);
      return (
        <>
          <div
            style={{
              display: "flex",
              width: "100%",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{render ? render(params) : String(params.value)}</span>
            <IconButton
              aria-label="more"
              id="long-button"
              aria-controls={isActionMenuOpen ? "long-menu" : undefined}
              aria-expanded={isActionMenuOpen ? "true" : undefined}
              aria-haspopup="true"
              onClick={(evt) => onMenuOpen(evt, params, filteredMenuOptions)}
            >
              <MoreVertIcon />
            </IconButton>
          </div>
        </>
      );
    };
  }, [renderOptionsRef?.current?.renderCell, records]);

  const onMenuOpen = (evt: SyntheticEvent<HTMLElement>, params:GridRenderCellParams<T, string, string, GridTreeNodeWithRender>, options:RenderCellMenuOption[]) => {
    let anchorEl = evt.currentTarget;
    setActionMenuAnchor(anchorEl);
    setIsActionMenuOpen(true);
    setActionMenuOptions(options);
  };

  const onMenuClose = () => {
    setActionMenuAnchor(null);
    setIsActionMenuOpen(false);
  };

  const renderSelectedActions = () => {
    if (!selected.length) return null;
    return selectedActions.map((action, i) => {
      return action.showIf === undefined || action.showIf(selected.map((id) => records.find((r) => r._id === id)!)) ? (
        <Button
          key={i}
          sx={{ margin: "5px" }}
          variant="contained"
          color={action.color}
          onClick={() => action.onClick(selected.map((id) => records.find(r=>r._id===id)!))}
        >
          {action.name}
        </Button>
      ) : null;
    });
  };

  function customFooter() {
    return (
      <div className={Styles.customFooterWrapper}>
        <div className={Styles.customFooterSelectedActions}>{renderSelectedActions()}</div>
        <GridFooter className={Styles.gridFooter} />
      </div>
    );
  }

  function renderComponent() {
    console.log(pageSizeOptions);
    return (
      <Container style={{padding:0}} sx={sx} className={Styles.dataGridWrapper}>
        <DataGrid<T>
          rows={records}
          rowCount={recordCount}
          loading={loading}
          columns={columns}
          sortModel={sortModel}
          onSortModelChange={(model) => {
            if (!_.isEqual(sortModel, model)) setSortModel(model);
          }}
          checkboxSelection
          disableRowSelectionOnClick
          onRowSelectionModelChange={onSelectionModelChange}
          editMode="row"
          slots={{footer:customFooter}}
          // components={{ Footer: customFooter }}
          getRowId={(r)=>r.id || r._id.toString()}
          pageSizeOptions={pageSizeOptions}
          paginationMode={paginationMode}
          paginationModel={paginationModel}
          onPaginationModelChange={onPaginationModelChange}
        />
        <Menu
          id={"long-menu"}
          MenuListProps={{
            "aria-labelledby": "long-button",
          }}
          anchorEl={actionMenuAnchor}
          open={isActionMenuOpen}
          onClose={onMenuClose}
          slotProps={{paper:{
            style: {
              maxHeight: ITEM_HEIGHT * 4.5,
              width: "20ch",
            },
          }}}
        >
          {actionMenuOptions.map((option) => (
            <MenuItem
              key={option.name}
              onClick={(evt) => {
                setIsActionMenuOpen(false);
                option.onClick(evt);
              }}
            >
              {option.name}
            </MenuItem>
          ))}
        </Menu>
      </Container>
    );
  }

  return <>{renderComponent()}</>;
}
