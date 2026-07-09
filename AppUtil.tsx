import { DataTableFilterMetaData } from "primereact/datatable";
import { AppContext } from "../config/AppContextProvider";
import { URLParams } from "../constant/URLParams";
import { AuthContext } from "../dto/AuthContext";
import { FilterCriteria } from "../dto/FilterCriteria";
import { SearchCriteria } from "../dto/SearchCriteria";
import { SortCriteria } from "../dto/SortCriteria";
import { MessageSeverity } from "primereact/api";
import MessageBox from "../component/MessageBox";
import { PageAccess } from "../dto/PageAccess";
import { Menu } from "../dto/Menu";
import { PageRights } from "../constant/PageRights";
import { ActionType } from "../constant/ActionType";
import { MessageSeverities } from "../constant/MessageSeverities";
import { MenuItem } from "primereact/menuitem";
import { SearchOperation } from "../constant/SearchOperation";
import { AppConstants } from "../constant/AppConstant";
import axios from "axios";
import { API_PAYLOAD_SIGNATURE_SIGN_ENABLE, PAYLOAD_SIGNATURE_HEADER, AUTHORIZATION_HEADER, API_PAYLOAD_SIGNATURE_VERIFY_ENABLE, SKIP_SIGNATURE_VALIDATION_URLS, SKIP_SIGNATURE_GENERATION_URLS } from "../constant/ApiConstant";
import { verify, sign } from '../util/RsaUtil';

export class AppUtil {

    static goHome(navigate: any) {
        const countrySetup = AppContext.getCountrySetup();
        if (countrySetup != null && countrySetup.properties.ssoEnable === false) {
            const url = '/Login?' + URLParams.COUNTRY + '=' + countrySetup.countryCode;
            navigate(url, { state: { countrySetup: countrySetup } });
        } else {
            navigate("/");
        }
    }

    static buildMenuItems(menuList: Menu[] | null, menuClick: any) {
        let menuItemList: MenuItem[] = [];
        let menuItem: MenuItem;
        menuList?.forEach((menu) => {
            menuItem = { 'label': menu.name };
            if (menu.subMenus) {
                menuItem.items = this.buildMenuItems(menu.subMenus, menuClick);
            } else {
                menuItem.command = menuClick(menu);
                menuItem.className = 'rootMenuItem';
            }
            menuItemList.push(menuItem);
        });
        return menuItemList;
    }

    static buildFilterCriteriaCountry(filterParams: any) {
        let searchCriteria: SearchCriteria[] = [];
        let authContext: AuthContext | null = AppContext.getAuthContext();
        let search = new SearchCriteria();
        search.key = "countryCode";
        search.operation = SearchOperation.EQUAL;
        search.value = authContext.countryCode;
        searchCriteria.push(search);
        return this.buildFilterCriteria(filterParams, searchCriteria);
    }

    static buildFilterCriteriaCountryWithDefaultCountry(filterParams: any) {
        let searchCriteria: SearchCriteria[] = [];
        let authContext: AuthContext | null = AppContext.getAuthContext();
        let search = new SearchCriteria();
        let countries: String[] = [];
        countries.push("DF");
        countries.push(authContext.countryCode);
        search.key = "countryCode";
        search.operation = SearchOperation.IN;
        search.values = countries;
        searchCriteria.push(search);
        return this.buildFilterCriteria(filterParams, searchCriteria);
    }

    static buildFilterCriteriaCountryAndSearchCriteria(filterParams: any, inSearchCriteria: SearchCriteria[]) {
        let searchCriteria: SearchCriteria[] = [];
        let authContext: AuthContext | null = AppContext.getAuthContext();
        let search = new SearchCriteria();
        search.key = "countryCode";
        search.operation = SearchOperation.EQUAL;
        search.value = authContext.countryCode;
        searchCriteria.push(search);
        inSearchCriteria?.forEach(searchTemp => {
            searchCriteria.push(searchTemp);
        });
        return this.buildFilterCriteria(filterParams, searchCriteria);
    }

    static buildFilterCriteria(filterParams: any, searchCriteria: SearchCriteria[]) {
        let filterCriteria = new FilterCriteria();
        let search = null;
        if (filterParams !== null && filterParams?.page !== null) {
            filterCriteria.pageNo = filterParams.page + 1;
            filterCriteria.pageSize = 10;
        } else {
            filterCriteria.skipPageable = true;
        }
        if (filterParams?.filters) {
            Object.keys(filterParams.filters).forEach((key) => {
                let dataTableFilterMetaData: DataTableFilterMetaData = filterParams.filters[key];
                if (dataTableFilterMetaData.value !== undefined && dataTableFilterMetaData.value !== null) {
                    search = new SearchCriteria();
                    search.key = key;
                    if (dataTableFilterMetaData.matchMode === 'equals') {
                        search.operation = SearchOperation.EQUAL;
                        search.value = dataTableFilterMetaData.value;
                    } else {
                        search.operation = SearchOperation.LIKE_IGNORE_CASE;
                        search.value = "%" + dataTableFilterMetaData.value + "%";
                    }
                    searchCriteria.push(search);
                }
            });
        }
        if (filterParams?.sortField) {
            let sortCriteria: SortCriteria[] = [];
            let sort = new SortCriteria();
            sort.key = filterParams.sortField;
            if (filterParams.sortOrder === 1) {
                sort.operation = "ASC";
            } else {
                sort.operation = "DESC";
            }
            sortCriteria.push(sort);
            filterCriteria.sortCriteria = sortCriteria;
        }
        else if (filterParams?.multiSortMeta) {
            let sortCriteria: SortCriteria[] = [];
            filterParams?.multiSortMeta?.forEach((element: { field: string; order: number }) => {
                let sort = new SortCriteria();
                sort.key = element.field;
                if (element.order === 1) {
                    sort.operation = "ASC";
                } else {
                    sort.operation = "DESC";
                }
                sortCriteria.push(sort);
            });
            filterCriteria.sortCriteria = sortCriteria;
        }
        filterCriteria.searchCriteria = searchCriteria;
        return filterCriteria;
    }

    static getReportGenerationTypes(screenNeed: boolean): string[] {
        let reportGenerationTypes: any = [];
        if (screenNeed) {
            reportGenerationTypes.push({ label: 'ON-SCREEN', value: 'RESULT' });
        }
        reportGenerationTypes.push({ label: 'PDF', value: 'PDF' });
        reportGenerationTypes.push({ label: 'XLSX', value: 'XLSX' });
        return reportGenerationTypes;
    }

    static downloadFromURI(uri: any, name: string) {
        let link = document.createElement("a");
        link.download = name;
        link.href = uri;
        link.click();
    }

    static getDefaultFilterParamsWithInitalRows(initalRows: number): any {
        let filterParams = { first: 0, rows: initalRows, page: 0 };
        return filterParams;
    }

    static getDefaultFilterParams(): any {
        return this.getDefaultFilterParamsWithInitalRows(10);
    }

    static readAsDataURL(file: any): Promise<any> {
        return new Promise((resolve, reject) => {
            let fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = () => resolve(fileReader.result);
            fileReader.onerror = error => reject(error);
        });
    }

    static showExceptionMessage(message: string, exception: any) {
        if (exception?.code) {
            if (exception?.severity === MessageSeverities.INFO) {
                return this.showMessage(MessageSeverity.INFO, exception.message, true, false, 2000);
            } else {
                let header: string;
                let severity: any;
                if (exception?.severity === MessageSeverities.WARN) {
                    header = "Warning";
                    severity = MessageSeverity.WARN;
                } else {
                    header = "Error";
                    severity = MessageSeverity.ERROR;
                }
                let content = (
                    <div>
                        <p><b>Code</b>: {exception.code} - {exception.title}</p>
                        <p><b>Tracking Id</b>: {exception.trackingId} </p>
                    </div>
                );
                let sumary: any = <MessageBox message={exception.message} header={header} content={content} />
                return this.showMessage(severity, sumary, true, false, 2000);
            }
        } else {
            return this.showMessage(MessageSeverity.ERROR, message + (exception.message ? ('. ' + exception.message) : ''), true, false, 2000);
        }
    }

    static showErrorMessage(message: string) {
        return this.showMessage(MessageSeverity.ERROR, message, true, false, 2000);
    }

    static showInfoMessage(message: string) {
        return this.showMessage(MessageSeverity.INFO, message, true, false, 2000);
    }

    static showSuccessMessage(message: string) {
        return this.showMessage(MessageSeverity.SUCCESS, message, true, false, 2000);
    }

    static showWarningMessage(message: string) {
        return this.showMessage(MessageSeverity.WARN, message, true, false, 2000);
    }

    static showMessage(severity: any, summary: any, sticky: boolean, closable: boolean, life: number) {
        let message: any = { severity: severity, summary: summary, sticky: sticky, life: life, closable: closable };
        return message;
    }

    static buildPageAccess(menu: Menu) {
        let pageAccess: PageAccess = new PageAccess();
        if (menu?.roleMenuRights) {
            menu?.roleMenuRights.forEach(rights => {
                if (rights === PageRights.ADD) {
                    pageAccess.addAccess = true;
                } else if (rights === PageRights.DELETE) {
                    pageAccess.deleteAccess = true;
                } else if (rights === PageRights.EDIT) {
                    pageAccess.editAccess = true;
                } else if (rights === PageRights.VIEW) {
                    pageAccess.viewAccess = true;
                } else if (rights === PageRights.APPROVAL) {
                    pageAccess.approvalAccess = true;
                } else if (rights === PageRights.VIEW_ALL) {
                    pageAccess.viewAllAccess = true;
                } else if (rights === PageRights.MAKER) {
                    pageAccess.makerAccess = true;
                } else if (rights === PageRights.CHECKER) {
                    pageAccess.checkerAccess = true;
                } else if (rights === PageRights.OPERATOR) {
                    pageAccess.operatorAccess = true;
                }
            });
        }
        return pageAccess;
    }

    static buildApprovalRequesTypes() {
        let requestTypes = [];
        requestTypes.push(ActionType.ADD);
        requestTypes.push(ActionType.EDIT);
        requestTypes.push(ActionType.DELETE);
        return requestTypes;
    }

    static isKeyInArray(array: any, key: any) {
        if (array) {
            return key in array;
        }
        return false;
    }

    static isFoundInArray(array: any, input: any) {
        let result = false;
        array.forEach((element : any) => {
            if (element === input) {
                result = true;
                return;
            }
        });
        return result;
    }

    static unAuthorize(navigate: any) {
        AppContext.clearAuthData();
        navigate("/unAuthorize");
    }

    static urlMatch(url: string, urlList: string[]) {
        let result = false;
        if (url && urlList) {
            urlList.forEach((urlTemp) => {
                if (urlTemp === url) {
                    result = true;
                    return;
                }
            })
        }
        return result;
    }

    static getTextBoxKeyFilter(): RegExp {
        if (AppContext.getCountrySetup()?.properties?.textBoxKeyFilter) {
            return new RegExp(AppContext.getCountrySetup()?.properties?.textBoxKeyFilter!);
        } else {
            return new RegExp(AppConstants.DEFAULT_TEXT_BOX_KEY_FILTER);
        }
    }

    static getTextAreaKeyFilter(): RegExp {
        if (AppContext.getCountrySetup()?.properties?.textAreaKeyFilter) {
            return new RegExp(AppContext.getCountrySetup()?.properties?.textAreaKeyFilter!);
        } else {
            return new RegExp(AppConstants.DEFAULT_TEXT_AREA_KEY_FILTER);
        }
    }

    static getJobStatusFilterList(): string[] {
        let activeList: any = [];
        activeList.push({ label: 'Run', value: true });
        activeList.push({ label: 'Hold', value: false });
        return activeList;
    }

    static setupAxiosInterceptors(navigate: any) {
        axios.interceptors.request.use(
            requestConfig => {
                if (AppContext.isLoggedIn()) {
                    const skipUrl = this.urlMatch(requestConfig.url!, SKIP_SIGNATURE_GENERATION_URLS);
                    if (skipUrl === false && API_PAYLOAD_SIGNATURE_SIGN_ENABLE && AppContext.getApiPayloadSignatureSignKey()) {
                        let signatureData = requestConfig.url;
                        if (requestConfig.headers![AUTHORIZATION_HEADER]) {
                            signatureData = signatureData + "#" + requestConfig.headers![AUTHORIZATION_HEADER];
                        }
                        if (requestConfig.data) {
                            signatureData = signatureData + "#" + JSON.stringify(requestConfig.data);
                        }
                        const signature = sign(AppContext.getApiPayloadSignatureSignKey(), signatureData!);
                        requestConfig.headers![PAYLOAD_SIGNATURE_HEADER] = signature;
                    }
                }
                return requestConfig;
            }
        );

        axios.interceptors.response.use(
            responseConfig => {
                if (AppContext.isLoggedIn()) {
                    try {
                        const skipUrl = this.urlMatch(responseConfig.config.url!, SKIP_SIGNATURE_VALIDATION_URLS);
                        if (skipUrl === false && API_PAYLOAD_SIGNATURE_VERIFY_ENABLE && responseConfig.data) {
                            const signature = responseConfig.headers[PAYLOAD_SIGNATURE_HEADER];
                            if (signature) {
                                const signatureValid = verify(AppContext.getApiPayloadSignatureVerifyKey(), signature, JSON.stringify(responseConfig.data));
                                if (!signatureValid) {
                                    this.unAuthorize(navigate);
                                }
                            } else {
                                this.unAuthorize(navigate);
                            }
                        }
                    } catch (e) {
                        this.unAuthorize(navigate);
                    }
                }
                return responseConfig;
            },
            error => {
                if (AppContext.isLoggedIn()) {
                    const { status } = error.response || {};
                    if (status === 401) {
                        this.unAuthorize(navigate);
                    }
                }
                return Promise.reject(error);
            }
        );
    }

}
