import { render, cleanup,fireEvent, screen, RenderResult, act, waitFor } from "@testing-library/react";
import { AppContext } from "config/AppContextProvider";
import { AuthContext } from "dto/AuthContext";
import { MemoryRouter } from 'react-router-dom';
import CardTransCode from "pages/transactionModule/CardTransCode";


const mockAuthContext = () => {
    let authContext: AuthContext = new AuthContext();
    authContext.countryCode = "BD";
    authContext.username = "1616146";
    authContext.timezone = "Asia/Dhaka";
    AppContext.getAuthContext = jest.fn().mockReturnValue(authContext);
  };

afterEach(cleanup);

 

jest.mock('service/TransactionService', () => ({ 
    txnManagementAction: jest.fn(),
    getTxnByAlertIdAndType: jest.fn(),
    getAllActiveAlertConfigurationByCountryCode: jest.fn(),
    getAllActiveAlertCategories: jest.fn(),
}));

jest.mock('service/LanguageService', () => ({ 
    getAllLanguage: jest.fn()
}));

describe('CardTransCode Form', ()=>{
  
    beforeEach(()=>{
       jest.clearAllMocks();
    })

    
it("maker landing page", async () => {
  mockAuthContext();
  AppContext.getCurrentMenu = jest.fn().mockReturnValue({"userRights":"VIEW,ADD,EDIT,DELETE,VIEWDETAIL,RE_ACTIVATE,RE_ACTIVATE,SYNC,VIEW_ALERT_LIST,EDIT_ALERT_LIST,VIEW_CUST_HISTORY"});
  const {getAllLanguage} = require("service/LanguageService");
  getAllLanguage.mockResolvedValue([{"countryCode":"VN","languageCode":"ENG","defaultLanguage":true,"activeStatus":true,"description":"English","createdBy":"SYSTEM","updatedBy":"SYSTEM"}]);            
  const {getTxnByAlertIdAndType} = require("service/TransactionService");
  getTxnByAlertIdAndType.mockResolvedValue(getTxnByAlertIdAndTypeMock());
  const {getAllActiveAlertConfigurationByCountryCode} = require("service/TransactionService");
  getAllActiveAlertConfigurationByCountryCode.mockResolvedValue(getAllActiveAlertConfigurationByCountryCodeMock());
  let component!: RenderResult;    
  const props = {
    location: {
        state: { operation: "maker", txnCode : 'addTranscode'}
    }
    }
    
  await act(async () => {
      component = render(
          <MemoryRouter>
              <CardTransCode {...props}/>
          </MemoryRouter>
      );
  });
  await waitFor(() => expect(component.asFragment()).toMatchSnapshot());
},60_000);

 

  

});

const getTxnByAlertIdAndTypeMock = () =>{
    return {
        "content": [
            {
                "alertSetupId": 193,
                "countryCode": "VN",
                "alertCodeId": 8,
                "categoryId": 8,
                "alertType": "CARDS_TRANSACTION_ALERTS",
                "alertSubType": "PRIMARY_SUPP_CARD_ALERTS",
                "interfaceName": "C400",
                "transGroupCode": "1105",
                "transCode": "11",
                "transCodeName": "Local Cash",
                "transactionDescription": "Local Cash",
                "transType": "11",
                "thresholdWaive": false,
                "emailOverride": true,
                "mobileOverride": true,
                "customerProfileRequired": true,
                "customerPreferenceRequired": false,
                "profileActivationRequired": true,
                "strategySequence": 1,
                "serviceName": "REALTIME",
                "setupProperties": {},
                "resource": "TxnManagement",
                "approvalSetupKey": "VN_TxnManagement_",
                "defaultSmsEnabled": true,
                "defaultEmailEnabled": true,
                "defaultPushEnabled": true,
                "active": true
            },
            {
                "alertSetupId": 194,
                "countryCode": "VN",
                "alertCodeId": 8,
                "categoryId": 8,
                "alertType": "CARDS_TRANSACTION_ALERTS",
                "alertSubType": "PRIMARY_SUPP_CARD_ALERTS",
                "interfaceName": "C400",
                "transGroupCode": "1105",
                "transCode": "12",
                "transCodeName": "Local Mail/phone order or electronic commerce",
                "transactionDescription": "Local Mail/phone order or electronic commerce",
                "transType": "12",
                "thresholdWaive": false,
                "emailOverride": true,
                "mobileOverride": true,
                "customerProfileRequired": true,
                "customerPreferenceRequired": false,
                "profileActivationRequired": true,
                "strategySequence": 1,
                "serviceName": "REALTIME",
                "setupProperties": {},
                "resource": "TxnManagement",
                "approvalSetupKey": "VN_TxnManagement_",
                "defaultSmsEnabled": true,
                "defaultEmailEnabled": true,
                "defaultPushEnabled": true,
                "active": true
            },
            {
                "alertSetupId": 195,
                "countryCode": "VN",
                "alertCodeId": 8,
                "categoryId": 8,
                "alertType": "CARDS_TRANSACTION_ALERTS",
                "alertSubType": "PRIMARY_SUPP_CARD_ALERTS",
                "interfaceName": "C400",
                "transGroupCode": "1105",
                "transCode": "13",
                "transCodeName": "Local Other",
                "transactionDescription": "Local Other",
                "transType": "13",
                "thresholdWaive": false,
                "emailOverride": true,
                "mobileOverride": true,
                "customerProfileRequired": true,
                "customerPreferenceRequired": false,
                "profileActivationRequired": true,
                "strategySequence": 1,
                "serviceName": "REALTIME",
                "setupProperties": {},
                "resource": "TxnManagement",
                "approvalSetupKey": "VN_TxnManagement_",
                "defaultSmsEnabled": true,
                "defaultEmailEnabled": true,
                "defaultPushEnabled": true,
                "active": true
            },
            {
                "alertSetupId": 196,
                "countryCode": "VN",
                "alertCodeId": 8,
                "categoryId": 8,
                "alertType": "CARDS_TRANSACTION_ALERTS",
                "alertSubType": "PRIMARY_SUPP_CARD_ALERTS",
                "interfaceName": "C400",
                "transGroupCode": "1105",
                "transCode": "21",
                "transCodeName": "International Cash",
                "transactionDescription": "International Cash",
                "transType": "21",
                "thresholdWaive": false,
                "emailOverride": true,
                "mobileOverride": true,
                "customerProfileRequired": true,
                "customerPreferenceRequired": false,
                "profileActivationRequired": true,
                "strategySequence": 1,
                "serviceName": "REALTIME",
                "setupProperties": {},
                "resource": "TxnManagement",
                "approvalSetupKey": "VN_TxnManagement_",
                "defaultSmsEnabled": true,
                "defaultEmailEnabled": true,
                "defaultPushEnabled": true,
                "active": true
            },
            {
                "alertSetupId": 197,
                "countryCode": "VN",
                "alertCodeId": 8,
                "categoryId": 8,
                "alertType": "CARDS_TRANSACTION_ALERTS",
                "alertSubType": "PRIMARY_SUPP_CARD_ALERTS",
                "interfaceName": "C400",
                "transGroupCode": "1105",
                "transCode": "22",
                "transCodeName": "International Mail/phone order or electronic commerce",
                "transactionDescription": "International Mail/phone order or electronic commerce",
                "transType": "22",
                "thresholdWaive": false,
                "emailOverride": true,
                "mobileOverride": true,
                "customerProfileRequired": true,
                "customerPreferenceRequired": false,
                "profileActivationRequired": true,
                "strategySequence": 1,
                "serviceName": "REALTIME",
                "setupProperties": {},
                "resource": "TxnManagement",
                "approvalSetupKey": "VN_TxnManagement_",
                "defaultSmsEnabled": true,
                "defaultEmailEnabled": true,
                "defaultPushEnabled": true,
                "active": true
            },
            {
                "alertSetupId": 198,
                "countryCode": "VN",
                "alertCodeId": 8,
                "categoryId": 8,
                "alertType": "CARDS_TRANSACTION_ALERTS",
                "alertSubType": "PRIMARY_SUPP_CARD_ALERTS",
                "interfaceName": "C400",
                "transGroupCode": "1105",
                "transCode": "23",
                "transCodeName": "International Other",
                "transactionDescription": "International Other",
                "transType": "23",
                "thresholdWaive": false,
                "emailOverride": true,
                "mobileOverride": true,
                "customerProfileRequired": true,
                "customerPreferenceRequired": false,
                "profileActivationRequired": true,
                "strategySequence": 1,
                "serviceName": "REALTIME",
                "setupProperties": {},
                "resource": "TxnManagement",
                "approvalSetupKey": "VN_TxnManagement_",
                "defaultSmsEnabled": true,
                "defaultEmailEnabled": true,
                "defaultPushEnabled": true,
                "active": true
            }
        ],
        "number": 0,
        "size": 20,
        "totalElements": 6,
        "pageable": {
            "pageNumber": 0,
            "pageSize": 20,
            "sort": {
                "empty": true,
                "sorted": false,
                "unsorted": true
            },
            "offset": 0,
            "paged": true,
            "unpaged": false
        },
        "last": true,
        "totalPages": 1,
        "sort": {
            "empty": true,
            "sorted": false,
            "unsorted": true
        },
        "first": true,
        "numberOfElements": 6,
        "empty": false
    }
}

const getAllActiveAlertConfigurationByCountryCodeMock = ()=>{
    let result =
        [
            {
                "cnfAlertId": 2,
                "countryCode": "VN",
                "interfaceName": "C400",
                "serviceName": "BATCH",
                "alertType": "CARDS_REPORTING_ALERTS",
                "defaultSmsEnabled": true,
                "defaultEmailEnabled": false,
                "defaultPushEnabled": false,
                "cacheTemplate": false,
                "cacheSetup": false,
                "retryMaximumTries": 0,
                "active": true,
                "transTypeGroupEnabled": false
            },
            {
                "cnfAlertId": 3,
                "countryCode": "VN",
                "interfaceName": "C400",
                "serviceName": "REALTIME",
                "alertType": "CARDS_TRANSACTION_ALERTS",
                "defaultSmsEnabled": true,
                "defaultEmailEnabled": false,
                "defaultPushEnabled": false,
                "cacheTemplate": false,
                "cacheSetup": false,
                "retryMaximumTries": 0,
                "active": true,
                "transTypeGroupEnabled": false
            },
            {
                "cnfAlertId": 4,
                "countryCode": "VN",
                "interfaceName": "CMP",
                "serviceName": "REALTIME",
                "alertType": "CMP_ALERTS",
                "defaultSmsEnabled": true,
                "defaultEmailEnabled": false,
                "defaultPushEnabled": false,
                "cacheTemplate": false,
                "cacheSetup": false,
                "retryMaximumTries": 0,
                "active": true,
                "transTypeGroupEnabled": false
            },
            {
                "cnfAlertId": 5,
                "countryCode": "VN",
                "interfaceName": "CMP",
                "serviceName": "BATCH",
                "alertType": "CUST_DACTIVATION_DELETION",
                "defaultSmsEnabled": true,
                "defaultEmailEnabled": false,
                "defaultPushEnabled": false,
                "cacheTemplate": false,
                "cacheSetup": false,
                "retryMaximumTries": 0,
                "active": true,
                "transTypeGroupEnabled": false
            },
            {
                "cnfAlertId": 7,
                "countryCode": "VN",
                "interfaceName": "CMP",
                "serviceName": "BATCH",
                "alertType": "WELCOME_MESSAGE",
                "defaultSmsEnabled": true,
                "defaultEmailEnabled": false,
                "defaultPushEnabled": false,
                "cacheTemplate": false,
                "cacheSetup": false,
                "retryMaximumTries": 0,
                "active": true,
                "transTypeGroupEnabled": false
            },
            {
                "cnfAlertId": 1,
                "countryCode": "VN",
                "interfaceName": "EBBS",
                "serviceName": "REALTIME",
                "alertType": "BANKING_ALERTS",
                "defaultSmsEnabled": true,
                "defaultEmailEnabled": false,
                "defaultPushEnabled": false,
                "cacheTemplate": false,
                "cacheSetup": false,
                "retryMaximumTries": 0,
                "properties": {
                    "profileRequired": false,
                    "profilePreferencesRequired": false,
                    "messageFormat": "JSON",
                    "applySerialNumberFromDebitCard": true,
                    "removeMobileNumberLeadingZeros": true,
                    "transactionAmountFieldName": "LocalCurrAmt"
                },
                "active": true,
                "transTypeGroupEnabled": false
            },
            {
                "cnfAlertId": 6,
                "countryCode": "VN",
                "interfaceName": "RRE",
                "serviceName": "REALTIME",
                "alertType": "REWARD_ALERTS",
                "defaultSmsEnabled": true,
                "defaultEmailEnabled": false,
                "defaultPushEnabled": false,
                "cacheTemplate": false,
                "cacheSetup": false,
                "retryMaximumTries": 0,
                "properties": {
                    "profileRequired": false,
                    "profilePreferencesRequired": false,
                    "messageFormat": "JSON",
                    "languageCodeTemplate": "<#if channelMessageInfo.cardLanguage == 'E'>ENG<#elseif (channelMessageInfo.cardLanguage == 'C' || channelMessageInfo.cardLanguage == 'F' )>VNE<#else>ENG</#if>"
                },
                "active": true,
                "transTypeGroupEnabled": false
            }
        ];
    return result;
}
