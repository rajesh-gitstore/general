import axios from 'axios';
import { API_OAUTH_CLIENT_ID, API_OAUTH_ENCRYPTION, API_OAUTH_RO_GRANT_TYPE, API_OAUTH_RT_GRANT_TYPE, API_OAUTH_SECURITY_KEY_PARAM, API_OAUTH_SSO_GRANT_TYPE, API_PAYLOAD_SIGNATURE_SIGN_ENABLE, API_PAYLOAD_SIGNATURE_VERIFY_ENABLE, GET_SSO_INIT_URL, GET_SSO_REQUEST, POST_REVOKE_TOKEN, POST_TOKEN } from "../constant/ApiConstant";
import { AuthRequest } from "../dto/AuthRequest";
import { AuthResponse } from "../dto/AuthResponse";
import { AppContext } from "../config/AppContextProvider";
import { AuthContext } from "../dto/AuthContext";
import { SsoRequest } from '../dto/SsoRequest';
import { AesUtil } from '../util/AesUtil';
import { AppConstants } from '../constant/AppConstant';
import { encrypt } from '../util/RsaUtil';

export class AuthenticationService {

    static authenticate(authRequest: AuthRequest): Promise<AuthResponse> {
        return new Promise((resolve, reject) => {
            const params = new URLSearchParams();
            let clientId = API_OAUTH_CLIENT_ID;
            if (authRequest.uiOAuthClient) {
                clientId = authRequest.uiOAuthClient;
            }
            params.append('client_id', clientId);
            params.append('grant_type', API_OAUTH_RO_GRANT_TYPE);
            params.append('username', authRequest.username);
            params.append('password', authRequest.password);
            params.append('country', authRequest.countryCode);
            const key = AesUtil.generateKey();
            const authenticateConfig = {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
            axios
                .post(POST_TOKEN, this.buildFinalParams(params, key), authenticateConfig)
                .then((authenticateRes) => {
                    let resData = this.getResponseData(key, authenticateRes);
                    if (authenticateRes.status === 200) {
                        this.buildAuthContext(resData, authRequest);
                    }
                    resolve(resData);
                })
                .catch((err) => {
                    if (err.response) {
                        reject(err.response.data);
                    }
                    reject(err);
                });
        });
    }

    static refreshToken(): Promise<AuthResponse> {
        return new Promise((resolve, reject) => {
            const params = new URLSearchParams();
            let clientId = API_OAUTH_CLIENT_ID;
            if (AppContext!.getCountrySetup()!.properties!.uiOAuthClient) {
                clientId = AppContext!.getCountrySetup()!.properties!.uiOAuthClient;
            }
            params.append('client_id', clientId);
            params.append('grant_type', API_OAUTH_RT_GRANT_TYPE);
            params.append('refresh_token', AppContext.getRefreshToken());
            const key = AesUtil.generateKey();
            const config = {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
            axios
                .post(POST_TOKEN, this.buildFinalParams(params, key), config)
                .then((res) => {
                    let resData = this.getResponseData(key, res);
                    if (res.status === 200) {

                        AppContext.setAccessToken(resData.access_token);
                        AppContext.setRefreshToken(resData.refresh_token);
                        AppContext.setExpiredIn(resData.expires_in);
                    }
                    resolve(resData);
                })
                .catch((err) => {
                    if (err.response) {
                        reject(err.response.data);
                    }
                    reject(err);
                });
        });
    }

    static revokeAccessToken(): Promise<any> {
        return new Promise((resolve, reject) => {
            const params = new URLSearchParams();
            let clientId = API_OAUTH_CLIENT_ID;
            if (AppContext!.getCountrySetup()!.properties!.uiOAuthClient) {
                clientId = AppContext!.getCountrySetup()!.properties!.uiOAuthClient;
            }
            params.append('client_id', clientId);
            params.append('token_type', 'access_token');
            params.append('token', AppContext.getAccessToken());
            const config = {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
            axios
                .post(POST_REVOKE_TOKEN, params, config)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((err) => {
                    if (err.response) {
                        reject(err.response.data);
                    }
                    reject(err);
                });
        });
    }

    static ssoAuthenticate(ssoRequest: SsoRequest): Promise<AuthResponse> {
        return new Promise((resolve, reject) => {
            const params = new URLSearchParams();
            let clientId = API_OAUTH_CLIENT_ID;
            if (ssoRequest.uiOAuthClient) {
                clientId = ssoRequest.uiOAuthClient;
            }
            params.append('client_id', clientId);
            params.append('grant_type', API_OAUTH_SSO_GRANT_TYPE);
            params.append('request_id', ssoRequest.requestId);
            const key = AesUtil.generateKey();
            const config = {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
            axios
                .post(POST_TOKEN, this.buildFinalParams(params, key), config)
                .then((res) => {
                    let resData = this.getResponseData(key, res);
                    if (res.status === 200) {
                        resData = this.buildAuthContext(resData, null);
                    }
                    resolve(resData);
                })
                .catch((err) => {
                    if (err.response) {
                        reject(err.response.data);
                    }
                    reject(err);
                });
        });
    }

    static ssoLogin(ssoRequest: SsoRequest): Promise<any> {
        return new Promise((resolve, reject) => {
            axios
                .get(GET_SSO_REQUEST(ssoRequest.countryCode, ssoRequest.loginType))
                .then((res) => {
                    if (res.status === 200) {
                        resolve(res.data);
                    } else {
                        if (res.data) {
                            reject(res.data);
                        }
                        reject(res);
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        reject(err.response.data);
                    }
                    reject(err);
                });
        });
    }

    static ssoInit(ssoRequest: SsoRequest): Promise<any> {
        return new Promise((resolve, reject) => {
            axios
                .get(GET_SSO_INIT_URL(ssoRequest.countryCode, ssoRequest.loginType))
                .then((res) => {
                    if (res.status === 200) {
                        resolve(res.data);
                    } else {
                        if (res.data) {
                            reject(res.data);
                        }
                        reject(res);
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        reject(err.response.data);
                    }
                    reject(err);
                });
        });
    }

    static buildFinalParams(params: URLSearchParams, key: string) {
        if (API_OAUTH_ENCRYPTION) {
            params.append(API_OAUTH_SECURITY_KEY_PARAM, key);
            const finalParams = new URLSearchParams();
            finalParams.append(AppConstants.ENCRYPTION_APPENDER, encrypt(AppContext.getApiSecurityKey(), JSON.stringify(Object.fromEntries(params))));
            return finalParams;
        } else {
            return params;
        }
    }

    static buildAuthContext(resData: any, authRequest: AuthRequest | null) {
        AppContext.setAccessToken(resData.access_token);
        AppContext.setRefreshToken(resData.refresh_token);
        AppContext.setExpiredIn(resData.expires_in);
        AppContext.setIsLoggedIn(true);
        let authContext = new AuthContext();
        let timezone = Intl.DateTimeFormat()?.resolvedOptions()?.timeZone;
        if (authRequest) {
            authContext.countryCode = authRequest!.countryCode;
            authContext.username = authRequest!.username;
        } else {
            authContext.countryCode = resData.country;
            authContext.username = resData.username;
        }
        if (AppContext.getCountrySetup()?.properties.userTimezoneEnable) {
            if (timezone) {
                authContext.timezone = timezone;
            } else {
                authContext.timezone = AppContext.getCountrySetup()?.properties?.timezone!;
            }
        } else {
            authContext.timezone = AppContext.getCountrySetup()?.properties?.timezone!;
        }
        AppContext.setAuthContext(authContext);
        if (API_PAYLOAD_SIGNATURE_SIGN_ENABLE) {
            AppContext.setApiPayloadSignatureSignKey(resData.private_key);
        }
        if (API_PAYLOAD_SIGNATURE_VERIFY_ENABLE) {
            AppContext.setApiPayloadSignatureVerifyKey(AppContext.getApiSecurityKey());
        }
    }

    static getResponseData(key: string, res: any) {
        if (res.status === 200) {
            if (API_OAUTH_ENCRYPTION) {
                const decyptedResData =  AesUtil.decrypt(key, res.data[AppConstants.ENCRYPTION_APPENDER]);
                return JSON.parse(decyptedResData);
            }
        }
        return res.data;
    }
    
}
