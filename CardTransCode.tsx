import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import {
  Grid,
  Typography,
  Button,
  Checkbox,
  TextField,
  Box,
  FormControlLabel,
  InputLabel,
  FormControl,
  NativeSelect,
  FormHelperText
} from '@mui/material';
import Alert from 'components/controls/Alert';
import InputSelect from 'components/controls/InputSelect';
import Dialog from 'components/controls/Dialog';
import { txnManagementAction, getTxnByAlertIdAndType } from 'service/TransactionService';
import { getAlertGroupByType, getAllActiveAlertConfigurationByCountryCode, getAllActiveAlertCategories } from 'service/AlertService';
import { TxnManageDto } from 'dto/txnManagement/TxnManageDto';
import { Template } from 'dto/txnManagement/Template';
import { TxnErrorState } from 'dto/txnManagement/TxnErrorState';
import { AppContext } from 'config/AppContextProvider';
import { AuthContext } from 'dto/AuthContext';
import { ApprovalStatus } from 'constant/ApprovalStatus';
import { ActionType } from 'constant/ActionType';
import { AppConstant } from 'constant/AppConstant';
import { ApprovalType } from 'constant/ApprovalType';
import { CountryCode } from 'constant/CountryCode';
import { AlertConfiguration } from "dto/alertCategoryModule/AlertConfiguration";
import { AlertCategory } from "dto/alertCategoryModule/AlertCategory";
import { RoutePathConstant } from "constant/RoutePathConstant";
import { MenuRights } from "constant/MenuRights";
import { Language } from 'dto/common/Language';
import { getAllLanguage } from 'service/LanguageService';
import { CountrySetup } from 'dto/CountrySetup';

const CardTransCode = (props: any) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get dependencies needed for useState initialization
  const authContext: AuthContext = AppContext.getAuthContext();
  const countrySetup: CountrySetup = AppContext.getCountrySetup();
  const txnCode = location.state?.txnCode;
  const operation = location.state?.operation;
  const menuRights = AppContext.getCurrentMenu()?.userRights as undefined as string;
  
  // All hooks must be called unconditionally
  const [openAppDialog, setOpenAppDialog] = useState(false);
  const [openRejDialog, setOpenRejDialog] = useState(false);
  const [languageList, setLanguageList] = useState<Language[]>();
  const [alertTypes, setAlertTypes] = useState<AlertConfiguration[]>();
  const [alertCategory, setAlertCategory] = useState<AlertCategory[]>();
  const [rejectReason, setRejectReason] = useState('');
  const [saved, setSaved] = useState(false);
  const [performSave, setPerformSave] = useState(false);
  const [alertGroup, setAlertGroup] = useState([]);
  const [jsonData, setJsonData] = useState({
    setupProperties: "",
    narrationCriteria: "",
    generalCriterionDto: ""
  });
  const [cardErrState, setCardErrState] = useState<TxnErrorState>({
    transactionDescription: "",
    transCode: "",
    alertCodeId: "",
    subscribeCode: "",
    alertType: "",
    active: "",
    debitThresholdValue: "",
    smsTemplate: ""
  });
  const [formData, setFormData] = useState<TxnManageDto>({
    alertSetupId: null,
    countryCode: authContext.countryCode,
    alertCodeId: null,
    categoryId: null,
    alertType: '',
    alertSubType: '',
    interfaceName: '',
    transGroupCode: '',
    transGroupName: '',
    transGroupType: '',
    transGroupChannelId: '',
    transCode: '',
    transCodeName: '',
    transactionDescription: '',
    transactionDescriptionZH: '',
    transactionDescriptionCN: '',
    transType: '',
    channelId: '',
    subChannelId: '',
    thresholdWaive: false,
    creditThresholdValue: null,
    debitThresholdValue: null,
    subscribeCode: '',
    subscriptionCodeDescription: '',
    emailOverride: false,
    mobileOverride: false,
    customerProfileRequired: false,
    customerPreferenceRequired: false,
    profileActivationRequired: false,
    narrationType: '',
    generalCriterionDto: null,
    strategySequence: null,
    narrationCriteria: null,
    callBackSettingsDto: {
      emailPushCallbackEnable: false,
      smsEmailCallbackEnable: false,
      smsPushCallbackEnable: false
    },
    serviceName: '',
    setupProperties: null,
    groupBy: '',
    requestId: '',
    alertSetupTempId: null,
    transactionType: '',
    remarks: '',
    approvalType: (txnCode !== 'addTranscode') ? ApprovalType.UPDATE : ApprovalType.ADD,
    approvalStatus: '',
    approvedBy: '',
    createdBy: '',
    updatedBy: '',
    actionType: (txnCode !== 'addTranscode') ? ActionType.UPDATE : ActionType.ADD,
    approvedTimestamp: null,
    templateDtoList: null,
    defaultSmsEnabled: false,
    defaultEmailEnabled: false,
    defaultPushEnabled: false,
    active: undefined
  });
  const [alert, setAlert] = useState({
    severity: '',
    title: '',
    message: '',
    show: false,
  });
  
  // All useEffect hooks must be called unconditionally
  
  // Safety check for location state - redirect if missing
  React.useEffect(() => {
    if (!location.state) {
      navigate(RoutePathConstant.HOME);
    }
  }, [location.state, navigate]);

  useEffect(() => {
    if (performSave) {
      trackPromise(
        txnManagementAction(authContext.countryCode, formData).then((value: any) => {
          setSaved(true);
          setAlert({
            title: 'Transaction Code Operation Performed Success',
            message: `Transaction Code ${formData.actionType} operation performed successful`,
            severity: 'success',
            show: true
          });
        })
      ).catch((e: any) => {
        setAlert({
          title: (e?.title !== null) ? e.title : 'Transaction Code Operation failed',
          message: (e?.message !== null) ? e.message : `Transaction code ${formData.actionType} operation Failed`,
          severity: 'error',
          show: true
        });
      });
      setPerformSave(false);
    }
  }, [performSave]);

  const loadLanguages=()=>{
    trackPromise(
      getAllLanguage(authContext.countryCode).then(data => {
        setLanguageList(data)
      })
    ).catch((e: any) => {
      setAlert({
        title: 'Get All Language failed',
        message: (e?.message !== null) ? e.message : 'Get all Language failed',
        severity: 'error',
        show: true
      });
    });
  }

  const getInitialTemplates = () => {
    let cardTemplateList: Template[] = [];
      let cardTemplate:Template;
      languageList?.forEach(lang=>{
        cardTemplate =  {
          countryCode: authContext.countryCode,
          languageCode: lang.languageCode,
          templateCode: '',
          alertSetupId: null,
          smsTemplate: '',
          emailTemplate: '',
          emailSubject: '',
          emailTitle: '',
          pushTemplate: '',
          active: true
        }
        cardTemplateList.push(cardTemplate);
      });
    return cardTemplateList;
  }

  const initializeTemplate = (data: any) => {
    if (data) {
      if (data?.templateDtoList?.length < 1) {
        data.templateDtoList = getInitialTemplates();
      }
      data.approvalType = ApprovalType.UPDATE;
      data.approvalStatus = ApprovalStatus.PENDING;
      data.actionType = ActionType.UPDATE;
      data.updatedBy = AppContext.getUserProfile()?.username;
    } else {
      setFormData({
        ...formData,
        templateDtoList: getInitialTemplates(),
        approvalType: ApprovalType.ADD,
        approvalStatus: ApprovalStatus.PENDING,
        actionType: ActionType.ADD,
        createdBy: AppContext.getUserProfile()?.username,
        callBackSettingsDto: {
          emailPushCallbackEnable: false,
          smsEmailCallbackEnable: false,
          smsPushCallbackEnable: false
        }
      })
    }
  }

  const getTransCodeDetails = () => {
    trackPromise(
      getTxnByAlertIdAndType(authContext.countryCode, txnCode as string, true)
        .then(data => {
          setJsonData({
            setupProperties: JSON.stringify(data?.setupProperties),
            narrationCriteria: JSON.stringify(data?.narrationCriteria),
            generalCriterionDto: JSON.stringify(data?.generalCriterionDto)
          })
          initializeTemplate(data);
          setFormData(data);
        })
    ).catch((e: any) => {
      setAlert({
        title: (e?.title !== null) ? e.title : 'Get Transaction Code Details Failed',
        message: (e?.message !== null) ? e.message : `Get Transaction Code details for ${txnCode}`,
        severity: 'error',
        show: true
      });
    });
  }

  const getTransApprovalDetails = () => {
    trackPromise(
      getTxnByAlertIdAndType(authContext.countryCode, txnCode as string, false)
        .then(data => {
          setJsonData({
            setupProperties: JSON.stringify(data?.setupProperties),
            narrationCriteria: JSON.stringify(data?.narrationCriteria),
            generalCriterionDto: JSON.stringify(data?.generalCriterionDto)
          })
          data.updatedBy = AppContext.getUserProfile()?.username;
          setFormData(data);
        })
    ).catch((e: any) => {
      setAlert({
        title: (e?.title !== null) ? e.title : 'Get Transaction Code Details Failed',
        message: (e?.message !== null) ? e.message : `Get Tranasaction Code details for ${txnCode}`,
        severity: 'error',
        show: true
      });
    });
  }

  useEffect(() => {
    if (authContext.countryCode === CountryCode.HONGKONG || authContext.countryCode === CountryCode.CHINA) {
      trackPromise(
          getAlertGroupByType(authContext.countryCode, 'BT').then((data: any) => {
            setAlertGroup(data);
          })).catch((e: any) => {
            setAlert({
              title: (e?.title !== null) ? e.title : 'Get Alert Group By Type',
              message: (e?.message !== null) ? e.message : 'Get alert groups failed. Please contact system administrator',
              severity: 'error',
              show: true
            });
      })
    }
    trackPromise(
      getAllActiveAlertConfigurationByCountryCode(authContext.countryCode)
        .then(value => {
          let temp: AlertConfiguration[] = [];
          value?.map(val => {
            if (val.interfaceName === AppConstant.C400 || val.interfaceName === AppConstant.CCMS) {
              temp.push(val);
            }
          });
          if (temp) {
            setAlertTypes(temp);
          } else {
            setAlert({
              title: 'Alert Configuration not found',
              message: 'Alert configuration not found, Please check with system administrator',
              severity: 'error',
              show: true
            });
          }
        })
    ).catch((e: any) => {
      setAlert({
        title: (e?.title !== null) ? e.title : 'Get Alert Configuration Failed',
        message: (e?.message !== null) ? e.message : 'Get alert configuration failed',
        severity: 'error',
        show: true
      });
    });
    loadLanguages();
  }, [])

  useEffect(() => {
    if (txnCode === 'addTranscode') {
      setCardErrState({
        transactionDescription: "Please enter the Transaction Description",
        transCode: "Please enter the Transaction Code",
        alertCodeId: "Please select the Alert Category",
        subscribeCode: "Please select the Subscription Type",
        alertType: "Please select the Alert Type",
        active: "Please select the status of the alert",
        debitThresholdValue: "Please enter the Threshold Value",
        smsTemplate: "Please enter the SMS template"
      })
      initializeTemplate(null);
    } else {
      if (operation === 'checker') {
        getTransApprovalDetails()
      } else {
        getTransCodeDetails();
      }
    }
  }, [languageList])

  useEffect(() => {
    if (txnCode === 'addTransCode') {
      setFormData({
        ...formData,
        alertCodeId: null,
        transactionType: '',
        serviceName: ''
      })
      setCardErrState({ ...cardErrState, alertCodeId: 'Please select the Alert Category' });
    }
    if (formData?.alertType) {
      getAllActiveAlertCategories(authContext.countryCode)
        .then(value => {
          let temp: AlertCategory[] = [];
          value?.map(val => {
            if (val.alertType === formData.alertType) {
              temp.push(val);
            }
          });
          if (temp) {
            setAlertCategory(temp);
          } else {
            setAlert({
              title: 'Alert Categories not found',
              message: 'Alert categories not found, Please check with system administrator',
              severity: 'error',
              show: true
            });
          }
        }).catch((e: any) => {
          setAlert({
            title: (e?.title !== null) ? e.title : 'Get Alert Categories Failed',
            message: (e?.message !== null) ? e.message : 'Get alert categories failed',
            severity: 'error',
            show: true
          });
        });
    }
  }, [formData.alertType])
  
  // If no location state, render loading while redirect happens
  if (!location.state) {
    return <div>Redirecting...</div>;
  }

  const statusList = [
    { id: '1', name: 'Enabled' },
    { id: '2', name: 'Disabled' },
  ];

  const subscriptionType = [
    { id: 'NA', name: 'System Alert', value:null },
    { id: 'AUTO', name: 'Auto Subscribed', value:'AUTO' },
    { id: 'SUB', name:'Subscribed', value:'SUB' },
    { id: 'CUST', name: 'Customer level', value:'CUST' }
  ]

  const handleInputChange = (id: any, value: any) => {
    let newCallBackSettingDto = formData?.callBackSettingsDto;
    if(!newCallBackSettingDto){
      newCallBackSettingDto = {
        emailPushCallbackEnable:false,
        smsEmailCallbackEnable:false,
        smsPushCallbackEnable:false
      }
    }
    let updated = false;
    switch (id) {
      case "transactionDescription":
        value === '' ? setCardErrState({ ...cardErrState, [id]: 'Please enter the Transaction Description' }) : setCardErrState({ ...cardErrState, [id]: '' });
        break;
      case "transCode":
        value === '' ? setCardErrState({ ...cardErrState, [id]: 'Please enter the Transaction Code' }) : setCardErrState({ ...cardErrState, [id]: '' });
        break;
      case "alertCodeId":
        if (value === '') {
          let alertConfigValues = alertCategory?.find(x => x.categoryId === Number(value));
          setFormData({
            ...formData,
            alertCodeId: null,
            categoryId: null,
            transactionType: '',
            serviceName: '',
            interfaceName: ''
          })
          setCardErrState({ ...cardErrState, [id]: 'Please select the Alert Category' });
        } else {
          let alertConfigValues = alertCategory?.find(x => x.categoryId === Number(value));
          setFormData({
            ...formData,
            alertCodeId: Number(value),
            transactionType: alertConfigValues.productType,
            serviceName: alertConfigValues.serviceName,
            interfaceName: alertConfigValues.interfaceName,
            categoryId: alertConfigValues.categoryId
          })
          setCardErrState({ ...cardErrState, [id]: '' });
        }
        updated = true;
        break;
      case "subscribeCode":
        value === '' ? setCardErrState({ ...cardErrState, [id]: 'Please select the Subscription Type' }) : setCardErrState({ ...cardErrState, [id]: '' });
        break;
      case "alertType":
        if (value === '') {
          setCardErrState({ ...cardErrState, [id]: 'Please select the Alert Type' });
        } else {
          setCardErrState({ ...cardErrState, [id]: '' });
        }
        break;
      case "active":
        value === '' ? setCardErrState({ ...cardErrState, [id]: 'Please select the status of the alert' }) : setCardErrState({ ...cardErrState, [id]: '' });
        break;
      case "debitThresholdValue":
        value === '' ? setCardErrState({ ...cardErrState, [id]: 'Please enter the Threshold Value' }) : setCardErrState({ ...cardErrState, [id]: '' });
        break;
      case "narrationCriteria":
        setJsonData({ ...jsonData, narrationCriteria: value })
        updated = true;
        break;
      case "setupProperties":
        setJsonData({ ...jsonData, setupProperties: value })
        updated = true;
        break;
      case "generalCriterionDto":
        setJsonData({ ...jsonData, generalCriterionDto: value })
        updated = true;
        break;
      case "smsPushCallbackEnable":
        newCallBackSettingDto.smsPushCallbackEnable = value;
        setFormData({ ...formData, callBackSettingsDto: newCallBackSettingDto })
        updated = true;
        break;
      case "emailPushCallbackEnable":
        newCallBackSettingDto.emailPushCallbackEnable = value;
        setFormData({ ...formData, callBackSettingsDto: newCallBackSettingDto })
        updated = true;
        break;
      case "smsEmailCallbackEnable":
        newCallBackSettingDto.smsEmailCallbackEnable = value;
        setFormData({ ...formData, callBackSettingsDto: newCallBackSettingDto })
        updated = true;
        break;
      case "active":
        setFormData({ ...formData, [id]: (value === 'Enabled') ? true : false })
        updated = true;
        break;
      default:
        break;
    }

    if (!updated) {
      setFormData({
        ...formData,
        [id]: value,
      });

    }
  }

  const handleTemplateChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (menuRights?.includes(MenuRights.EDIT)) {
      let newTemplateDtoList = [...formData.templateDtoList];
      switch (e.target.id) {
        case 'smsTemplate':
          e.target.value === '' ? setCardErrState({ ...cardErrState, smsTemplate: 'Please enter the SMS template' }) : setCardErrState({ ...cardErrState, smsTemplate: '' });
          newTemplateDtoList[i].smsTemplate = e.target.value;
          break;
        case 'emailSubject':
          newTemplateDtoList[i].emailSubject = e.target.value;
          break;
        case 'emailTemplate':
          newTemplateDtoList[i].emailTemplate = e.target.value;
          break;
        case 'pushTemplate':
          newTemplateDtoList[i].pushTemplate = e.target.value;
          break;
        default:
          break;
      }
      setFormData({
        ...formData,
        templateDtoList: newTemplateDtoList
      });
    } else {
      setAlert({
        title: 'Transaction Management Access Error',
        message: 'The current user do not have CARD trans code - EDIT access',
        severity: 'error',
        show: true
      });
    }
  }

  const alertclose = () => {
    setAlert({ ...alert, show: false });
    if (saved) {
      handleCancel();
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

  const handleRejDialogConfirm = () => {
    setFormData({
      ...formData,
      actionType: ActionType.REJECT,
      remarks: rejectReason
    })
    setOpenRejDialog(false);
    setPerformSave(true);
  };

  const handleAppDialogConfirm = () => {
    setFormData({
      ...formData,
      actionType: ActionType.APPROVE,
      remarks: ''
    })
    setOpenAppDialog(false);
    setPerformSave(true);
  };

  const handleCancel = () => {
    if (operation === 'maker') {
      navigate(RoutePathConstant.CARD_TXN_CODE_SEARCH);
    } else {
      navigate(RoutePathConstant.CARD_TXN_CODE_APPROVE);
    }
  }

  const checkEditAccess = () => {
    return txnCode !== 'addTranscode' && menuRights?.includes(MenuRights.EDIT);
  }

  const handleSave = () => {
    if ((txnCode !== 'addTranscode' && menuRights?.includes(MenuRights.EDIT)) || (txnCode === 'addTranscode' && menuRights?.includes(MenuRights.ADD))) {
      setFormData({
        ...formData,
        alertSubType: formData.alertSubType ? formData.alertSubType : formData.alertType,
        setupProperties: jsonData?.setupProperties ? JSON.parse(jsonData?.setupProperties) : null,
        narrationCriteria: jsonData?.narrationCriteria ? JSON.parse(jsonData?.narrationCriteria) : null,
        generalCriterionDto: jsonData?.generalCriterionDto ? JSON.parse(jsonData?.generalCriterionDto) : null
      });
      var valid = true;
      let objKeys = Object.keys(cardErrState) as Array<keyof TxnErrorState>
      objKeys.map((item: keyof TxnErrorState, key: number) => {
        if (cardErrState[item] !== '') {
          valid = false;
        }
      })
      if (valid) {
        setPerformSave(true);
      } else {
        setAlert({
          title: 'Transaction code validation issue',
          message: 'Please make sure mandatory values are filled and all errors addressed before save',
          severity: 'error',
          show: true,
        });
      }
    } else {
      setAlert({
        title: 'Transaction Management Access Error',
        message: txnCode !== 'addTranscode' ? 'The current user do not have CARD trans code - EDIT access' : 'The current user do not have CARD trans code - ADD access',
        severity: 'error',
        show: true
      });
    }
  }



  // const notificationChannel = [
  //   { id: 1, name: 'SMS only', value:'S' },
  //   { id: 2, name: 'Push notification only', value:'P' },
  //   { id: 2, name: 'Push notification fallback SMS', value:'PFS' },
  // ];


  return (
    <Box sx={{ display: 'flex' }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h6" noWrap>
            {txnCode === 'addTranscode' ? 'Add Card Transaction Code' : 'View/Edit Card Transaction Code'}  &nbsp;&nbsp;
          </Typography>
        </Grid>
        {alert?.show && <Grid item xs={12}>
          <Alert alertInfo={alert} onClose={alertclose} />
        </Grid>}
        {(authContext.countryCode === CountryCode.HONGKONG || authContext.countryCode === CountryCode.CHINA) &&
          <React.Fragment>
            <Grid item xs={3}>
              <InputLabel sx={{ py: 1 }} id="transGroupTypeId">Transaction Group Type</InputLabel>
            </Grid>
            <Grid item xs={3}>
              <TextField
                id="transGroupType"
                InputLabelProps={{ shrink: formData?.transGroupType ? true : false }}
                value={formData?.transGroupType}
                label="Transaction Group Type"
                variant="outlined"
                size='small'
                onFocus={alertclose}
                fullWidth
                disabled={operation === 'checker'}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => { handleInputChange(event.target.id, event.target.value) }}
              />
            </Grid>
            <Grid item xs={3}>
              <InputLabel sx={{ py: 1 }} id="transGroupChannelId">Transaction Group Channel Id</InputLabel>
            </Grid>
            <Grid item xs={3}>
              <TextField
                id="transGroupChannelId"
                InputLabelProps={{ shrink: formData?.transGroupChannelId ? true : false }}
                value={formData?.transGroupChannelId}
                label="Transaction Group Channel Id"
                variant="outlined"
                size='small'
                onFocus={alertclose}
                fullWidth
                disabled={operation === 'checker'}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => { handleInputChange(event.target.id, event.target.value) }}
              />
            </Grid>
          </React.Fragment>}
        <Grid item xs={3}>
          <InputLabel required sx={{ py: 1 }} id="transDescriptionLabel">Transaction Description</InputLabel>
        </Grid>
        <Grid item xs={6}>
          <TextField
            id="transactionDescription"
            InputLabelProps={{ shrink: formData?.transactionDescription ? true : false }}
            value={formData?.transactionDescription}
            label="Transaction Description"
            variant="outlined"
            size='small'
            onFocus={alertclose}
            fullWidth
            disabled={operation === 'checker'}
            helperText={cardErrState?.transactionDescription}
            error={cardErrState?.transactionDescription !== ''}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => { handleInputChange(event.target.id, event.target.value) }}
          />
        </Grid>
        <Grid item xs={3} />
        {(authContext.countryCode === CountryCode.HONGKONG  || authContext.countryCode === CountryCode.CHINA ) && (
          <React.Fragment>
            <Grid item xs={3}>
              <InputLabel sx={{ py: 1 }} id="transDescriptionZhLabel">Transaction Description (Chinese Traditional)</InputLabel>
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="transactionDescription_zh"
                InputLabelProps={{ shrink: formData?.transactionDescriptionZH ? true : false }}
                value={formData?.transactionDescriptionZH}
                label="Transaction Description (Chinese Traditional)"
                variant="outlined"
                size='small'
                onFocus={alertclose}
                disabled={operation === 'checker'}
                fullWidth
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => { handleInputChange(event.target.id, event.target.value) }}
              />
            </Grid>
            <Grid item xs={3} />
            <Grid item xs={3}>
              <InputLabel sx={{ py: 1 }} id="transDescriptionLabel">Transaction Description (Chinese Simplified)</InputLabel>
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="transactionDescription_cn"
                InputLabelProps={{ shrink: formData?.transactionDescriptionCN ? true : false }}
                value={formData?.transactionDescriptionCN}
                label="Transaction Description (Chinese Simplified)"
                variant="outlined"
                size='small'
                onFocus={alertclose}
                disabled={operation === 'checker'}
                fullWidth
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => { handleInputChange(event.target.id, event.target.value) }}
              />
            </Grid>
            <Grid item xs={3} />
          </React.Fragment>
        )}
        <Grid item xs={3}>
          <InputLabel required sx={{ py: 1 }} id="transCodeLabel">Transaction Code</InputLabel>
        </Grid>
        <Grid item xs={3}>
          <TextField
            id="transCode"
            InputLabelProps={{ shrink: formData?.transCode ? true : false }}
            value={formData?.transCode}
            label="Transaction Code"
            variant="outlined"
            size='small'
            onFocus={alertclose}
            fullWidth
            disabled={operation === 'checker'}
            helperText={cardErrState?.transCode}
            error={cardErrState?.transCode !== ''}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => { handleInputChange(event.target.id, event.target.value) }}
          />
        </Grid>
        <Grid item xs={3}>
          <InputLabel required sx={{ py: 1 }} id="alertTypeLabel">Alert Type</InputLabel>
        </Grid>
        <Grid item xs={3}>
          <InputSelect
            name='alertType'
            required={true}
            fullWidth={true}
            label='Alert Type'
            onFocus={alertclose}
            value={formData?.alertType ? formData.alertType : ''}
            onChange={handleInputChange}
            options={alertTypes}
            optionKey="cnfAlertId"
            optionValue="alertType"
            optionDesc="alertType"
            helperText={cardErrState?.alertType}
            error={cardErrState?.alertType !== ''}
            disabled={operation === 'checker' || checkEditAccess()} />
        </Grid>
        <Grid item xs={3}>
          <InputLabel required sx={{ py: 1 }} id="alertConfigLabel">Alert Category</InputLabel>
        </Grid>
        <Grid item xs={3}>
          <InputSelect
            name='alertCodeId'
            required={true}
            fullWidth={true}
            label='Alert Category'
            onFocus={alertclose}
            value={formData?.alertCodeId ? formData.alertCodeId : ''}
            onChange={handleInputChange}
            options={alertCategory}
            optionKey="categoryId"
            optionValue="categoryId"
            optionDesc="categoryName"
            helperText={cardErrState?.alertCodeId}
            error={cardErrState?.alertCodeId !== ''}
            disabled={operation === 'checker' || checkEditAccess()} />
        </Grid>
        <Grid item xs={3}>
          <InputLabel sx={{ py: 1 }} id="alertSubTypeLabel">Sub Alert Type</InputLabel>
        </Grid>
        <Grid item xs={3}>
          <TextField
            id="alertSubType"
            InputLabelProps={{ shrink: (formData?.alertSubType || formData.alertType) ? true : false }}
            value={formData?.alertSubType ? formData.alertSubType : formData.alertType}
            label="Sub Alert Type"
            variant="outlined"
            size='small'
            onFocus={alertclose}
            fullWidth
            disabled={operation === 'checker' || checkEditAccess()}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => { handleInputChange(event.target.id, event.target.value) }}
          />
        </Grid>
        <Grid item xs={3}>
          <InputLabel sx={{ py: 1 }} id="transTypeLabel">Trans Type</InputLabel>
        </Grid>
        <Grid item xs={3}>
          <TextField
            id="transType"
            InputLabelProps={{ shrink: formData?.transType ? true : false }}
            value={formData?.transType}
            label="Trans Type"
            variant="outlined"
            size='small'
            onFocus={alertclose}
            fullWidth
            disabled={operation === 'checker'}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => { handleInputChange(event.target.id, event.target.value) }}
          />
        </Grid>
        <Grid item xs={3}>
          <InputLabel sx={{ py: 1 }} id="transactionTypeLabel">Transaction Type</InputLabel>
        </Grid>
        <Grid item xs={3}>
          <TextField
            id="transactionType"
            InputLabelProps={{ shrink: formData?.transactionType ? true : false }}
            value={formData?.transactionType}
            label="Transaction Type"
            variant="outlined"
            size='small'
            onFocus={alertclose}
            fullWidth
            disabled
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => { handleInputChange(event.target.id, event.target.value) }}
          />
        </Grid>        
        <Grid item xs={3}>
              <InputLabel sx={{ py: 1 }} id="transGroupCodeId">Transaction Group Code</InputLabel>
            </Grid>
            <Grid item xs={3}>
              <TextField
                id="transGroupCode"
                InputLabelProps={{ shrink: formData?.transGroupCode ? true : false }}
                value={formData?.transGroupCode}
                label="Transaction Group Code"
                variant="outlined"
                size='small'
                onFocus={alertclose}
                fullWidth
                disabled={operation === 'checker'}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => { handleInputChange(event.target.id, event.target.value) }}
              />
            </Grid>
        <Grid item xs={6}/>
        <Grid item xs={3}>
          <InputLabel sx={{ py: 1 }} id="channelIdLabel">Channel</InputLabel>
        </Grid>
        <Grid item xs={3}>
          <TextField
            id="channelId"
            InputLabelProps={{ shrink: formData?.channelId ? true : false }}
            value={formData?.channelId}
            label="Channel"
            variant="outlined"
            size='small'
            onFocus={alertclose}
            disabled={operation === 'checker'}
            fullWidth
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => { handleInputChange(event.target.id, event.target.value) }}
          />
        </Grid>        
        {(authContext.countryCode === CountryCode.HONGKONG || authContext.countryCode === CountryCode.CHINA) ? (
          <React.Fragment>
            <Grid item xs={3}>
              <InputLabel sx={{ py: 1 }} id="subChannelIdLabel">Sub Channel</InputLabel>
            </Grid>
            <Grid item xs={3}>
              <TextField
                id="subChannelId"
                InputLabelProps={{ shrink: formData?.subChannelId ? true : false }}
                value={formData?.subChannelId}
                label="Sub Channel"
                variant="outlined"
                size='small'
                onFocus={alertclose}
                disabled={operation === 'checker'}
                fullWidth
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => { handleInputChange(event.target.id, event.target.value) }}
              />
            </Grid>
          </React.Fragment>
        ) : <Grid item xs={6} />}
        <Grid item xs={3}>
          <InputLabel required sx={{ py: 1 }} id="subcriptionCodeLabel">Subscription Type</InputLabel>
        </Grid>
        <Grid item xs={3}>
          <InputSelect
            name='subscribeCode'
            required={true}
            fullWidth={true}
            label='Subscription Type'
            onFocus={alertclose}
            value={formData?.subscribeCode}
            onChange={handleInputChange}
            options={subscriptionType}
            optionKey="id"
            optionValue="value"
            optionDesc="name"
            helperText={cardErrState?.subscribeCode}
            error={cardErrState?.subscribeCode !== ''}
            disabled={operation === 'checker'} />
        </Grid>
        <Grid item xs={3}>
          <InputLabel required sx={{ py: 1 }} id="activeLabel">Enable</InputLabel>
        </Grid>
        <Grid item xs={3}>
          <FormControl variant='outlined' size='small' fullWidth>
          <InputLabel variant="standard" htmlFor="statusSelect">
            Enable
          </InputLabel>
            <NativeSelect
              sx={{ m: 1 }}
              inputProps={{
                name: 'active',
                id: 'statusSelect',
              }}
              variant='outlined'
              onFocus={alertclose}
              error={cardErrState?.active !== ''}
              disabled={operation === 'checker'}
              value={(formData?.active === undefined) ? '' : (formData?.active === false) ? 'Disabled' : 'Enabled'}
              onChange={(e: any) => handleInputChange(e.target.name, (e.target.value === 'Disabled') ? false : (e.target.value === 'Enabled') ? true : '')}>
              <option value='' disabled></option>
              {statusList?.map((item) => {
                return (
                  <option key={item.id} id={item.id as unknown as string} value={item.name}>{item.name}</option>
                );
              })}
            </NativeSelect>
            {cardErrState?.active && <FormHelperText sx={{ color: '#d32f2f' }}>{cardErrState?.active}</FormHelperText>}
          </FormControl>
        </Grid>

        <Grid item xs={3}>
          <InputLabel required sx={{ py: 1 }} id="debitThresholdValueLabel">Threshold Value</InputLabel>
        </Grid>
        <Grid item xs={3}>
          <TextField
            id="debitThresholdValue"
            InputLabelProps={{ shrink: formData?.debitThresholdValue ? true : false }}
            value={formData?.debitThresholdValue === null ? '' : formData?.debitThresholdValue}
            label="Threshold Value"
            variant="outlined"
            size='small'
            onFocus={alertclose}
            fullWidth
            disabled={operation === 'checker'}
            helperText={cardErrState?.debitThresholdValue}
            error={cardErrState?.debitThresholdValue !== ''}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => { handleInputChange(event.target.id, event.target.value) }}
          />
        </Grid>
        <Grid item xs={3}>
          <FormControlLabel
            control={<Checkbox
              id={`thresholdWaive`}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e.target.id, e.target.checked)}
              checked={formData?.thresholdWaive}
              disabled={operation === 'checker'} />
            } label={"Threshold Waive"} labelPlacement="end" />
        </Grid>
        <Grid item xs={3} />

        <Grid item xs={3}>
          <InputLabel sx={{ py: 1 }} id="serviceNameLabel">Service Name</InputLabel>
        </Grid>
        <Grid item xs={3}>
          <TextField
            id="serviceName"
            InputLabelProps={{ shrink: formData?.serviceName ? true : false }}
            value={formData?.serviceName}
            label="Service Name"
            variant="outlined"
            size='small'
            onFocus={alertclose}
            disabled
            fullWidth
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => { handleInputChange(event.target.id, event.target.value) }}
          />
        </Grid>
        <Grid item xs={6} />
        <Grid item xs={12}>
          <Typography variant="h6" noWrap>General Settings</Typography>
        </Grid>
        <Grid item xs={6}>
          <FormControlLabel
            sx={{ width: 1 }}
            control={<Checkbox
              id={`defaultSmsEnabled`}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e.target.id, e.target.checked)}
              checked={formData?.defaultSmsEnabled}
              disabled={operation === 'checker'} />
            } label={"Default SMS enabled"} labelPlacement="end" />
          <FormControlLabel
            sx={{ width: 1 }}
            control={<Checkbox
              id={`defaultEmailEnabled`}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e.target.id, e.target.checked)}
              checked={formData?.defaultEmailEnabled}
              disabled={operation === 'checker'} />
            } label={"Default Email enabled"} labelPlacement="end" />
          <FormControlLabel
            sx={{ width: 1 }}
            control={<Checkbox
              id={`defaultPushEnabled`}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e.target.id, e.target.checked)}
              checked={formData?.defaultPushEnabled}
              disabled={operation === 'checker'} />
            } label={"Default Push enabled"} labelPlacement="end" />
          <FormControlLabel
            sx={{ width: 1 }}
            control={<Checkbox
              id={`customerProfileRequired`}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e.target.id, e.target.checked)}
              checked={formData?.customerProfileRequired}
              disabled={operation === 'checker'} />
            } label={"Customer Profile Required"} labelPlacement="end" />
          <FormControlLabel
            sx={{ width: 1 }}
            control={<Checkbox
              id={`customerPreferenceRequired`}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e.target.id, e.target.checked)}
              checked={formData?.customerPreferenceRequired}
              disabled={operation === 'checker'} />
            } label={"Customer Preference Required"} labelPlacement="end" />
          <FormControlLabel
            sx={{ width: 1 }}
            control={<Checkbox
              id={`mobileOverride`}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e.target.id, e.target.checked)}
              checked={formData?.mobileOverride}
              disabled={operation === 'checker'} />
            } label={"Mobile Overide"} labelPlacement="end" />
          <FormControlLabel
            sx={{ width: 1 }}
            control={<Checkbox
              id={`emailOverride`}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e.target.id, e.target.checked)}
              checked={formData?.emailOverride}
              disabled={operation === 'checker'} />
            } label={"Email Overide"} labelPlacement="end" />
          <FormControlLabel
            sx={{ width: 1 }}
            control={<Checkbox
              id={`profileActivationRequired`}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e.target.id, e.target.checked)}
              checked={formData?.profileActivationRequired}
              disabled={operation === 'checker'} />
            } label={"Profile Activation Required"} labelPlacement="end" />
        </Grid>
        <Grid item xs={6} />
        <Grid item xs={12}>
          <Typography variant="h6" noWrap>Call Back Settings</Typography>
        </Grid>
        <Grid item xs={6}>
          <FormControlLabel
            sx={{ width: 1 }}
            control={<Checkbox
              id={`smsPushCallbackEnable`}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e.target.id, e.target.checked)}
              checked={formData?.callBackSettingsDto?.smsPushCallbackEnable}
              disabled={operation === 'checker'} />
            } label={"SMS Push Callback Enabled"} labelPlacement="end" />
          <FormControlLabel
            sx={{ width: 1 }}
            control={<Checkbox
              id={`emailPushCallbackEnable`}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e.target.id, e.target.checked)}
              checked={formData?.callBackSettingsDto?.emailPushCallbackEnable}
              disabled={operation === 'checker'} />
            } label={"Email Push Callback Enabled"} labelPlacement="end" />
          <FormControlLabel
            sx={{ width: 1 }}
            control={<Checkbox
              id={`smsEmailCallbackEnable`}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e.target.id, e.target.checked)}
              checked={formData?.callBackSettingsDto?.smsEmailCallbackEnable}
              disabled={operation === 'checker'} />
            } label={"SMS and Email Callback Enabled"} labelPlacement="end" />
        </Grid>
        <Grid item xs={6} />
        <Grid item xs={3}>
          <InputLabel sx={{ py: 1 }} id="setupPropertiesLabel">Setup Properties</InputLabel>
        </Grid>
        <Grid item xs={6}>
          <TextField
            id="setupProperties"
            InputLabelProps={{ shrink: jsonData?.setupProperties ? true : false }}
            value={jsonData?.setupProperties}
            label="Setup Properties"
            variant="outlined"
            size='small'
            onFocus={alertclose}
            disabled={operation === 'checker'}
            fullWidth
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => { handleInputChange(event.target.id, event.target.value) }}
          />
          {
            operation !== 'checker' && 
            <FormHelperText>{'Please enter the valid json. Ex: {"firstSwipeValue":1, "maxCreditLimit":1, "intMobilePreference":true, "overseasATMTrans":true, "filterProductCode":true, "filterBlockCode":true, "filterInstructionCode":true, "filterAccountStatus":true, "filterRelCode":true, "p2PTransaction":true, "marlineTransaction":true, "timeDepositTransaction":true, "validateCustomerStatus":true, "validateCustLevelSMSEnableAlertCheck":true, "validateCustLevelSMSDisableAlertCheck":true, "validateCustLevelEmailEnableAlertCheck":true, "validateCustLevelEmailDisableAlertCheck":true, "transactionAmountFieldName":"XXX", "validateCustomerLevelAlertSetting":true, "IntMobilePreference":true, "payDueTriggerAlertDaysBefore":1}. Please note - if any values not required you can ignore and for empty please provide {} '}</FormHelperText>
          }          
        </Grid>
        <Grid item xs={3} />
        <Grid item xs={3}>
          <InputLabel sx={{ py: 1 }} id="narrationCriteriaStrategyLabel">Narration strategy</InputLabel>
        </Grid>
        <Grid item xs={6}>
          <TextField
            id="narrationCriteria"
            InputLabelProps={{ shrink: jsonData?.narrationCriteria ? true : false }}
            value={jsonData?.narrationCriteria}
            label="Narration strategy"
            variant="outlined"
            multiline
            size='small'
            onFocus={alertclose}
            disabled={operation === 'checker'}
            fullWidth
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => { handleInputChange(event.target.id, event.target.value) }}
          />
          {
            operation !== 'checker' && 
            <FormHelperText>{'Please enter the valid json. Ex:{"criteria":[ {"filterField":"limitEnhancementTypeCode", "filterMode":"EQUALS", "filterValue":"0011" } ]}. Please note - if any values not required you can ignore and for empty please provide {} '}</FormHelperText>
          }
        </Grid>
        <Grid item xs={3} />
        <Grid item xs={3}>
          <InputLabel sx={{ py: 1 }} id="generalCriteriaStrategyLabel">General Criteria Strategy</InputLabel>
        </Grid>
        <Grid item xs={6}>
          <TextField
            id="generalCriterionDto"
            InputLabelProps={{ shrink: jsonData?.generalCriterionDto ? true : false }}
            value={jsonData?.generalCriterionDto}
            label="General Criteria Strategy"
            variant="outlined"
            multiline
            size='small'
            onFocus={alertclose}
            disabled={operation === 'checker'}
            fullWidth
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => { handleInputChange(event.target.id, event.target.value) }}
          />
          {operation !== 'checker' && 
          <FormHelperText>{'Please enter the valid json. Ex: {"criterion":[{ "criteria":[ {"filterField":"limitEnhancementTypeCode", "filterMode":"EQUALS", "filterValue":"0011" } ]} ],"criterionCondition":"XXX"}. Please note - if any values not required you can ignore and for empty please provide {} '}</FormHelperText>
          }
          </Grid>
        <Grid item xs={3} />
        {formData?.templateDtoList && formData?.templateDtoList?.map((item: Template, i: number) => {
          return (
            <React.Fragment key={i}>
              <Grid item xs={12}>
                <Typography variant="h6" noWrap>{item?.languageCode} Language Messages</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="h6" noWrap>SMS</Typography>
              </Grid>
              <Grid item xs={9} />
              <Grid item xs={3}>
                <InputLabel required sx={{ py: 1 }} id="smsTemplateLabel">SMS Message</InputLabel>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  id="smsTemplate"
                  InputLabelProps={{ shrink: item?.smsTemplate ? true : false }}
                  value={item?.smsTemplate}
                  label="SMS Message"
                  variant="outlined"
                  multiline
                  size='small'
                  onFocus={alertclose}
                  disabled={operation === 'checker'}
                  fullWidth
                  helperText={cardErrState?.smsTemplate}
                  error={cardErrState?.smsTemplate !== ''}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleTemplateChange(i, event)}
                />
              </Grid>
              <Grid item xs={3} />
              {
                (countrySetup?.properties.emailServiceEnable) && <>
              <Grid item xs={3}>
                <Typography variant="h6" noWrap>Email</Typography>
              </Grid>
              <Grid item xs={9} />
              <Grid item xs={3}>
                <InputLabel sx={{ py: 1 }} id="emailSubjectLabel">Subject</InputLabel>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  id="emailSubject"
                  InputLabelProps={{ shrink: item?.emailSubject ? true : false }}
                  value={item?.emailSubject}
                  label="Subject"
                  variant="outlined"
                  multiline
                  size='small'
                  onFocus={alertclose}
                  disabled={operation === 'checker'}
                  fullWidth
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleTemplateChange(i, event)}
                />
              </Grid>
              <Grid item xs={3} />
              <Grid item xs={3}>
                <InputLabel sx={{ py: 1 }} id="emailTemplateLabel">Email Message</InputLabel>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  id="emailTemplate"
                  InputLabelProps={{ shrink: item?.emailTemplate ? true : false }}
                  value={item?.emailTemplate}
                  label="Email Message"
                  variant="outlined"
                  multiline
                  size='small'
                  onFocus={alertclose}
                  disabled={operation === 'checker'}
                  fullWidth
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleTemplateChange(i, event)}
                />
              </Grid>
              <Grid item xs={3} />
              </>
              }
              {
                (countrySetup?.properties.pushServiceEnable) && <>
              <Grid item xs={3}>
                <InputLabel sx={{ py: 1 }} id="pushTemplateLabel">PUSH Message</InputLabel>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  id="pushTemplate"
                  InputLabelProps={{ shrink: item?.pushTemplate ? true : false }}
                  value={item?.pushTemplate}
                  label="Push Message"
                  variant="outlined"
                  multiline
                  size='small'
                  onFocus={alertclose}
                  disabled={operation === 'checker'}
                  fullWidth
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleTemplateChange(i, event)}
                />
              </Grid>
              <Grid item xs={3} />
              </>
            }  
            </React.Fragment>
          )
        })}
        {operation === 'maker' && <Grid item xs={3}>
          <Button
            fullWidth
            sx={{ m: 1, bgcolor: '#3f51b5' }}
            variant='contained'
            color='primary'
            disabled={saved}
            onClick={e => handleSave()}
          >
            Save
          </Button>
        </Grid>}
        {operation === 'checker' && <React.Fragment>
          <Grid item xs={3}>
            <Button
              fullWidth
              sx={{ m: 1, bgcolor: '#3f51b5' }}
              variant='contained'
              color='primary'
              disabled={!menuRights?.includes(MenuRights.APPROVE) || saved}
              onClick={() => setOpenAppDialog(true)}>
              Approve
            </Button>
          </Grid>
          <Grid item xs={3}>
            <Button
              fullWidth
              sx={{ m: 1, bgcolor: '#3f51b5' }}
              variant='contained'
              color='primary'
              disabled={!menuRights?.includes(MenuRights.REJECT) || saved}
              onClick={() => setOpenRejDialog(true)}>
              Reject
            </Button>
          </Grid>
        </React.Fragment>}
        <Grid item xs={3}>
          <Button fullWidth
            sx={{ m: 1, bgcolor: '#3f51b5' }}
            variant='contained'
            color='primary' onClick={e => handleCancel()}>
            {!saved ? 'Cancel' : 'Back'}
          </Button>
        </Grid>
      </Grid>
      <Dialog
        open={openAppDialog}
        dialogTitle={'Approve confirmation'}
        dialogContent={'Are you sure you want to approve ?'}
        handleClose={() => setOpenAppDialog(false)}
        handleConfirm={handleAppDialogConfirm}
      />
      <Dialog
        open={openRejDialog}
        dialogTitle={'Reject confirmation'}
        dialogContent={
          'Are you sure you want to reject? If yes, Please specify reason below.'
        }
        dialogTextBox={rejReasonTextBox()}
        handleClose={() => setOpenRejDialog(false)}
        handleConfirm={handleRejDialogConfirm}
      />
    </Box>
  )
}


export default CardTransCode;
