import React from 'react';
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import { 
  Box, 
  CssBaseline, 
  Typography,
  Grid,
  Button,
  Pagination,
  Stack
} from '@mui/material';
import {
  DataGrid,
  GridRowsProp,
  GridSortModel,
  GridColDef,
  GridRowId,
  GridCellParams
} from '@mui/x-data-grid';
import Dialog from 'components/controls/Dialog';
import TextField from 'components/controls/TextField';
import Alert from 'components/controls/Alert';
import {alertConfigSearchChecker,alertConfigAction} from 'service/AlertService';
import { AppContext } from 'config/AppContextProvider';
import { AuthContext } from 'dto/AuthContext';
import { ApprovalStatus } from 'constant/ApprovalStatus';
import { ActionType } from 'constant/ActionType';
import { ApprovalType } from 'constant/ApprovalType';
import { FilterCriteria } from 'dto/common/FilterCriteria';
import { SearchOperation } from 'constant/SearchOperation';
import { RoutePathConstant } from "constant/RoutePathConstant";
import { MenuRights } from "constant/MenuRights";
import { getEnumKeyByEnumValue } from 'util/EnumUtil';
import { styled } from '@mui/material/styles';

const useStyles = styled({
  root: {
    '&.MuiDataGrid-viewport':{
      maxHeight: 'fit-content !important'
    },
    '&.MuiDataGrid-row':{
      maxHeight: 'fit-content !important'
    },
    '&.MuiDataGrid-renderingZone ':{
      maxHeight: 'fit-content !important'
    },
    '& .MuiDataGrid-iconSeparator': {
      display: 'none',
    },
    '& .MuiDataGrid-columnHeader': {
      paddingTop: '12px',
      paddingBottom: '12px',
      backgroundColor: '#3f51b5',
      color: '#fff',
      border: '0.5px solid #ddd',
      fontSize: '1Rem',
    },
    '& .MuiDataGrid-cell': {
      border: '0.5px solid #ddd',
      lineHeight: 'unset !important',
      maxHeight: 'none !important',
      whiteSpace: 'normal'
    },
    '& .MuiDataGrid-row': {
        maxHeight: 'none !important',
    },
  },
});

const AlertConfigCheckerSearch = () => {
  const authContext: AuthContext = AppContext.getAuthContext();
  const menuRights = AppContext.getCurrentMenu()?.userRights as undefined as string;
  const history = useHistory();
  const classes = useStyles();
  const [totalPages, setTotalPages] = useState(0);
  const[saved, setSaved] = useState(false);
  const [alertConfigList, setAlertConfigList] = useState<GridRowsProp>([]);  
  const [selectionModel, setSelectionModel] = useState<GridRowId[]>([]);
  const [openAppDialog, setOpenAppDialog] = useState(false);
  const [openRejDialog, setOpenRejDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'categoryId', sort: 'asc' }]);
  const [alert, setAlert] = useState({
    severity: '',
    title: '',
    message: '',
    show: false,
  });
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>({
    pageNo: 1,
    pageSize: 20,
    searchCriteria: [{key:'countryCode', operation:SearchOperation.EQUAL, value:authContext.countryCode},{key:'approvalStatus', operation:SearchOperation.EQUAL, value:ApprovalStatus.PENDING}],
    sortCriteria: [{ key:'categoryId', operation:'ASC'}]
  });

  const alertConfigTableColumns: GridColDef[] = [
    { field: 'categoryId', headerName: 'Alert Code', width: 160 },
    { field: 'categoryName', headerName: 'Alert Description', flex: 1 , sortable: false},
    { field: 'active', headerName: 'Alert Status', width:120, sortable:false,valueGetter: (params) => {
      if (params.value) {
        return 'Enabled';
      }
      return 'Disabled';
    }},
    { field: 'categoryCode', headerName: 'Status', width:120,valueGetter: (params) => {
      return 'Pending Review'
    } }
  ];
 

  const criteriaBuilder = () => {    
    const sortParams = sortModel[0];
    let sortDirection = sortParams.sort.toUpperCase();
    let criteria = { ...filterCriteria,
      sortCriteria:[{ key:sortParams.field, operation: sortDirection}]
    };
    setFilterCriteria(criteria);
    return criteria;    
  };

  const populateTableData = () => {    
    if (sortModel.length === 0) {      
      return;
    }    
    
    trackPromise(
      alertConfigSearchChecker(authContext.countryCode, criteriaBuilder())
      .then((value: any) => {
        if(value?.content){
          setAlertConfigList(value.content); 
          setTotalPages(value.totalPages);
        }else{
          setAlertConfigList([]); 
          setTotalPages(0);
          setAlert({
            title:'No Data - Error',
            message: 'No data available for the Alert Configuration Checker',
            severity: 'error',
            show: true 
          });  
        }    
        setSaved(true);   
      })
    ).catch((e:any)=>{
      setAlert({
          title:  (e?.title !== null)? e.title : 'Get Alert Config Approval List Failed',
          message: (e?.message !== null)? e.message :'Get Alert Config approval list failed. Please contact system administrator',
          severity: 'error',
          show: true
          });
      setAlertConfigList([]); 
      setSaved(false);
    })   
  };

  const handleCancel =() =>{
    history.push(RoutePathConstant.HOME)
  }
  const handleApprove = () => {
    setOpenAppDialog(false);
    appOrReject(true);    
  };

  const handleReject = () => {
    setOpenRejDialog(false);
    appOrReject(false);
  };
  
  const appOrReject = (isApprove:boolean) =>{
    let categoryId = selectionModel[0];
    const postBody = {
        countryCode: authContext.countryCode,
        categoryId: categoryId as string,
        categoryCode: categoryId as string,
        actionType: isApprove?ActionType.APPROVE:ActionType.REJECT,
        updatedBy: AppContext.getUserProfile()?.username,
        approvalType: ApprovalType.STATUS,
        rejectReason: isApprove?'':rejectReason,        
        approvalStatus: ApprovalStatus.PENDING,
      };
      trackPromise(
        alertConfigAction(authContext.countryCode,postBody).then((value:any) => {  
            setAlert({
              title: isApprove ? 'Alert Configuration Status - Approve Success' : 'Alert Configuration Status - Reject success',
              message: isApprove ? 'Alert Configuration status change - approved successfully' : 'Alert Configuration status change - rejected sucessfully', 
              severity: 'success',
              show: true
            });
          
      })).catch((e:any)=>{
          setAlert({
            title:  (e?.title !== null)? e.title : 'Alert Configuration Status Change Approve/Reject Failed',
            message: (e?.message !== null)? e.message : 'Alert Configuration status change Approve/Reject failed, Please contact administrator', 
            severity: 'error',
            show: true
          });
              });  if (isApprove) {
                setOpenAppDialog(false);
              } else {
                setOpenRejDialog(false);               
              }              
  }

  const rejReasonTextBox = () => {
    return (
      <div>
        <TextField
          autoFocus
          margin="dense"
          id="rejReason"
          label="Reject Reason"
          value={rejectReason}
          fullWidth
          onChange={e => setRejectReason(e.target.value)}
        />
      </div>
    );
  };
  
  const closeDialog = (isApprove:boolean) => {
    isApprove ? setOpenAppDialog(false) :setOpenRejDialog(false);      
    }  

    const closeAlert = () => {
      setAlert({
        severity: '',
        title: '',
        message: '',
        show: false,})
        if(saved){
          populateTableData();
          setSaved(false);
        }  
    }

  useEffect(
    () => {
      let active = true;
      populateTableData();
      if (!active) {
        return;
      }

      return () => {
        active = false;
      };
    },
    [sortModel, filterCriteria?.pageNo],
  );

  return (
    <Box sx={{ width: '80%', m: 1 }}>
      <CssBaseline />
      <Grid container spacing={3}>
        <Grid item xs={12}>
            <Typography variant="h6" noWrap sx={{ display: 'flex' }}>
                Alert Configuration Checker Approval
            </Typography>
        </Grid>
        {alert?.show && (<Grid item xs={12}><Alert alertInfo={alert} onClose={() => closeAlert()} /></Grid>)}        
        { (totalPages !== 0) && 
          (<Grid item xs={12}>
            <Stack spacing={2}>
              <Pagination count={totalPages} showFirstButton showLastButton onChange={(event: React.ChangeEvent<unknown>, value: number) => {setFilterCriteria({...filterCriteria, pageNo:value})}}/>
            </Stack> 
          </Grid>)}
        <Grid item xs={12} sx={{display: 'flex', overflowY: 'auto',  minHeight: '350px'}}>
            <DataGrid
                className={classes.root}
                disableColumnMenu
                getRowId={r => r.categoryId}
                pageSize={20}
                rows={alertConfigList}
                columns={alertConfigTableColumns}
                hideFooterPagination   
                sortingMode='server'
                sortModel={sortModel}
                onSortModelChange={(newModel: GridSortModel) => setSortModel(newModel)}
                loading={false}         
                hideFooterSelectedRowCount 
                checkboxSelection
                selectionModel={selectionModel}
                onSelectionModelChange={selection => {
                    const newSelectionModel = selection;
                    if (newSelectionModel.length > 1) {
                        const selectionSet = new Set(selectionModel);
                        const result = newSelectionModel.filter(
                        (s: any) => !selectionSet.has(s),
                    );
                    setSelectionModel(result);
                    } else {
                        setSelectionModel(newSelectionModel);
                    }
                }}        
            />
        </Grid> 
        <Grid item xs={3} />
        <Grid item xs={3}>
          <Button
            sx={{minWidth:'200px', float:'right', bgcolor: '#3f51b5'}}
            variant='contained'
            color='primary'
            disabled = {!menuRights?.includes(MenuRights.APPROVE)}
            onClick={() => setOpenAppDialog(true)} >
            Approve          
            </Button>
        </Grid>
        <Grid item xs={3}>
          <Button
            sx={{minWidth:'200px', float:'right', bgcolor: '#3f51b5'}}
            variant='contained'
            color='primary'
            disabled = {!menuRights?.includes(MenuRights.REJECT)}
            onClick={() => setOpenRejDialog(true)} >
            Reject          </Button>
        </Grid>
        <Grid item xs={3}>
          <Button  
            sx={{minWidth:'200px', float:'right', bgcolor: '#3f51b5'}}
            variant='contained'
            color='primary'
            onClick={handleCancel}>
            Cancel
          </Button>
        </Grid>           
      </Grid>
      <Dialog
      open={openAppDialog}
      dialogTitle={'Approve confirmation'}
      dialogContent={'Are you sure you want to approve ?'}
      handleClose={() => closeDialog(true)}
      handleConfirm={handleApprove}
    />
    <Dialog
      open={openRejDialog}
      dialogTitle={'Reject confirmation'}
      dialogContent={
        'Are you sure you want to reject? If yes, Please specify reason below.'
      }
      dialogTextBox={rejReasonTextBox()}
      handleClose={() => closeDialog(false)}
      handleConfirm={handleReject}
    />  
    </Box>
  );
};

export default AlertConfigCheckerSearch;
