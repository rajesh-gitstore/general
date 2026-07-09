import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { APP_CONTEXT_ROOT } from "../constant/ApiConstant";
import LayoutRoute from "../component/LayoutRoute";
import { InternalPagePaths } from "../constant/InternalPagePaths";
import { lazy, Suspense } from "react";
import PageLoader from "../component/PageLoader";

const PreLogin = lazy(() => import('../pages/PreLogin'));
const Error404 = lazy(() => import('../pages/Error404'));
const UnAuthorized = lazy(() => import('../pages/UnAuthorized'));
const Login = lazy(() => import("../pages/Login"));
const SsoLogin = lazy(() => import("../pages/SsoLogin"));
const SsoResponse = lazy(() => import("../pages/SsoResponse"));
const SsoInit = lazy(() => import("../pages/SsoInit"));

const Home = lazy(() => import("../pages/Home"));
const UserProfile = lazy(() => import("../pages/UserProfile"));

const UserManagement = lazy(() => import("../pages/UserManagement"));
const UserApproval = lazy(() => import("../pages/UserApproval"));
const UserDetail = lazy(() => import("../pages/UserDetail"));

const RoleManagement = lazy(() => import("../pages/RoleManagement"));
const RoleApproval = lazy(() => import("../pages/RoleApproval"));
const RoleDetail = lazy(() => import("../pages/RoleDetail"));

const UserListReport = lazy(() => import("../pages/UserListReport"));
const UserRightsReport = lazy(() => import("../pages/UserRightsReport"));
const EmailDeliveryReport = lazy(() => import("../pages/EmailDeliveryReport"));
const SmsDeliveryReport = lazy(() => import("../pages/SmsDeliveryReport"));
const PushDeliveryReport = lazy(() => import("../pages/PushDeliveryReport"));
const CasaCustomerAuditReport = lazy(() => import("../pages/CasaCustomerAuditReport"));

const BulkUploadManagement = lazy(() => import("../pages/BulkUploadManagement"));
const BulkUploadApproval = lazy(() => import("../pages/BulkUploadApproval"));
const BulkUploadDetail = lazy(() => import("../pages/BulkUploadDetail"));
const BulkUploadAlertReport = lazy(() => import("../pages/BulkUploadAlertReport"));

const CampaignManagement = lazy(() => import("../pages/CampaignManagement"));
const CampaignDetails = lazy(() => import("../pages/CampaignDetails"));
const CampaignApproval = lazy(() => import("../pages/CampaignApproval"));

const EbbsMessageSetupManagement = lazy(() => import("../modules/alert-processor/pages/EbbsMessageSetupManagement"));
const EbbsMessageSetupApproval = lazy(() => import("../modules/alert-processor/pages/EbbsMessageSetupApproval"));
const EbbsMessageSetupDetails = lazy(() => import("../modules/alert-processor/pages/EbbsMessageSetupDetails"));


const C400MessageSetupManagement = lazy(() => import("../modules/alert-processor/pages/C400MessageSetupManagement"));
const C400MessageSetupApproval = lazy(() => import("../modules/alert-processor/pages/C400MessageSetupApproval"));
const C400MessageSetupDetails = lazy(() => import("../modules/alert-processor/pages/C400MessageSetupDetails"));

const CardCustomerAuditReport = lazy(() => import("../pages/CardCustomerAuditReport"));

const CasaCustomerContactUpdateBatchReport = lazy(() => import("../pages/CasaCustomerContactUpdateBatchReport"));
const CardCustomerUpdateBatchReport = lazy(() => import("../pages/CardCustomerUpdateBatchReport"));

const CustomerManagement = lazy(() => import("../modules/customer/pages/CustomerManagement"));
const CustomerApproval = lazy(() => import("../modules/customer/pages/CustomerApproval"));
const CustomerDetails = lazy(() => import("../modules/customer/pages/CustomerDetails"));
const CustomerEnquiry = lazy(() => import("../modules/customer/pages/CustomerEnquiry"));

const CasaCustomerManagement = lazy(() => import("../modules/customer/pages/CasaCustomerManagement"));
const CasaCustomerApproval = lazy(() => import("../modules/customer/pages/CasaCustomerApproval"));
const CasaCustomerDetails = lazy(() => import("../modules/customer/pages/CasaCustomerDetails"));
const CasaCustomerEnquiry = lazy(() => import("../modules/customer/pages/CasaCustomerEnquiry"));
const CustomerAuditReport = lazy(() => import("../pages/CustomerAuditReport"));

const CardCustomerManagement = lazy(() => import("../modules/customer/pages/CardCustomerManagement"));
const CardCustomerApproval = lazy(() => import("../modules/customer/pages/CardCustomerApproval"));
const CardCustomerDetails = lazy(() => import("../modules/customer/pages/CardCustomerDetails"));
const CardCustomerEnquiry = lazy(() => import("../modules/customer/pages/CardCustomerEnquiry"));

const BatchJobReport = lazy(() => import("../pages/BatchJobReport"));
const BatchJobManagement = lazy(() => import("../modules/batch/pages/BatchJobManagement"));
const BatchJobDetails = lazy(() => import("../modules/batch/pages/BatchJobDetails"));
const BatchJobMessageAction = lazy(() => import("../modules/batch/pages/BatchJobMessageMgmt"));


const RouterConfig = () => (
    <div>
        <BrowserRouter basename={APP_CONTEXT_ROOT}>
            {/* <AxiosInterceptorSetup /> */}
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    <Route path="/" element={<LayoutRoute authRequired={false} page={PreLogin} />} />
                    <Route path="/Login" element={<LayoutRoute authRequired={false} page={Login} />} />
                    <Route path="/SSOLogin" element={<LayoutRoute authRequired={false} page={SsoLogin} />} />
                    <Route path="/SSOResponse" element={<LayoutRoute authRequired={false} page={SsoResponse} />} />
                    <Route path="/SSOInit" element={<LayoutRoute authRequired={false} page={SsoInit} />} />

                    <Route path="/home" element={<LayoutRoute page={Home} />} />
                    <Route path="/UserProfile" element={<LayoutRoute page={UserProfile} />} />
                    <Route path="/UserManagement" element={<LayoutRoute page={UserManagement} />} />
                    <Route path="/UserApproval" element={<LayoutRoute page={UserApproval} />} />
                    <Route path="/RoleManagement" element={<LayoutRoute page={RoleManagement} />} />
                    <Route path="/RoleApproval" element={<LayoutRoute page={RoleApproval} />} />
                    <Route path="/UserListReport" element={<LayoutRoute page={UserListReport} />} />
                    <Route path="/UserRightsReport" element={<LayoutRoute page={UserRightsReport} />} />
                    <Route path="/EmailDeliveryReport" element={<LayoutRoute page={EmailDeliveryReport} />} />
                    <Route path="/SmsDeliveryReport" element={<LayoutRoute page={SmsDeliveryReport} />} />
                    <Route path="/PushDeliveryReport" element={<LayoutRoute page={PushDeliveryReport} />} />
                    <Route path="/BulkUploadManagement" element={<LayoutRoute page={BulkUploadManagement} />} />
                    <Route path="/BulkUploadApproval" element={<LayoutRoute page={BulkUploadApproval} />} />
                    <Route path="/CampaignManagement" element={<LayoutRoute page={CampaignManagement} />} />
                    <Route path="/CampaignApproval" element={<LayoutRoute page={CampaignApproval} />} />
                    <Route path="/EbbsMessageSetupManagement" element={<LayoutRoute page={EbbsMessageSetupManagement} />} />
                    <Route path="/EbbsMessageSetupApproval" element={<LayoutRoute page={EbbsMessageSetupApproval} />} />
                    <Route path="/BulkUploadAlertReport" element={<LayoutRoute page={BulkUploadAlertReport} />} />
                    <Route path="/C400MessageSetupManagement" element={<LayoutRoute page={C400MessageSetupManagement} />} />
                    <Route path="/C400MessageSetupApproval" element={<LayoutRoute page={C400MessageSetupApproval} />} />
                    <Route path="/CardCustomerAuditReport" element={<LayoutRoute page={CardCustomerAuditReport} />} />
                    <Route path="/CasaCustomerAuditReport" element={<LayoutRoute page={CasaCustomerAuditReport} />} />
                    <Route path="/CasaCustomerContactUpdateBatchReport" element={<LayoutRoute page={CasaCustomerContactUpdateBatchReport} />} />
                    <Route path="/CardCustomerUpdateBatchReport" element={<LayoutRoute page={CardCustomerUpdateBatchReport} />} />
                    <Route path="/CustomerManagement" element={<LayoutRoute page={CustomerManagement} />} />
                    <Route path="/CustomerApproval" element={<LayoutRoute page={CustomerApproval} />} />
                    <Route path="/CustomerEnquiry" element={<LayoutRoute page={CustomerEnquiry} />} />
                    <Route path="/CasaCustomerManagement" element={<LayoutRoute page={CasaCustomerManagement} />} />
                    <Route path="/CasaCustomerApproval" element={<LayoutRoute page={CasaCustomerApproval} />} />
                    <Route path="/CasaCustomerEnquiry" element={<LayoutRoute page={CasaCustomerEnquiry} />} />
                    <Route path="/CardCustomerManagement" element={<LayoutRoute page={CardCustomerManagement} />} />
                    <Route path="/CardCustomerApproval" element={<LayoutRoute page={CardCustomerApproval} />} />
                    <Route path="/CardCustomerEnquiry" element={<LayoutRoute page={CardCustomerEnquiry} />} />
                    <Route path="/CustomerAuditReport" element={<LayoutRoute page={CustomerAuditReport} />} />
                    <Route path="/BatchJobReport" element={<LayoutRoute page={BatchJobReport} />} />
                    <Route path="/BatchJobManagement" element={<LayoutRoute page={BatchJobManagement} />} />


                    <Route path={InternalPagePaths.C400_MESSAGE_SETUP_DETAIL_PATH} element={<LayoutRoute page={C400MessageSetupDetails} />} />
                    <Route path={InternalPagePaths.EBBS_MESSAGE_SETUP_DETAIL_PATH} element={<LayoutRoute page={EbbsMessageSetupDetails} />} />
                    <Route path={InternalPagePaths.CAMPAIGN_DETAIL_PATH} element={<LayoutRoute page={CampaignDetails} />} />
                    <Route path={InternalPagePaths.USER_DETAIL_PATH} element={<LayoutRoute page={UserDetail} />} />
                    <Route path={InternalPagePaths.ROLE_DETAIL_PATH} element={<LayoutRoute page={RoleDetail} />} />
                    <Route path={InternalPagePaths.BULK_UPLOAD_INFO_DETAIL_PATH} element={<LayoutRoute page={BulkUploadDetail} />} />
                    <Route path={InternalPagePaths.CUSTOMER_DETAIL_PATH} element={<LayoutRoute page={CustomerDetails} />} />
                    <Route path={InternalPagePaths.CASA_CUSTOMER_DETAIL_PATH} element={<LayoutRoute page={CasaCustomerDetails} />} />
                    <Route path={InternalPagePaths.CARD_CUSTOMER_DETAIL_PATH} element={<LayoutRoute page={CardCustomerDetails} />} />
                    <Route path={InternalPagePaths.BATCH_JOB_DETAIL_PATH} element={<LayoutRoute page={BatchJobDetails} />} />
                    <Route path={InternalPagePaths.BATCH_JOB_MESSAGE_MGMT_PATH} element={<LayoutRoute page={BatchJobMessageAction} />} />


                    <Route path="/unAuthorize" element={<LayoutRoute authRequired={false} page={UnAuthorized} />} />
                    <Route path="*" element={<LayoutRoute authRequired={false} page={Error404} />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    </div >
);

export default RouterConfig;
