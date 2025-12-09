package com.sc.rdc.cmp.alert.dispatcher.gateway;
import com.fasterxml.jackson.core.type.TypeReference;
import com.sc.rdc.cmp.alert.dispatcher.constant.AppErrorCodes;
import com.sc.rdc.cmp.alert.dispatcher.constant.DispatherConstant;
import com.sc.rdc.cmp.alert.dispatcher.constant.SmsStatusCode;
import com.sc.rdc.cmp.alert.dispatcher.payload.SmsPayload;
import com.sc.rdc.cmp.alert.dispatcher.persistence.entity.SmsAggregatorSetup;
import com.sc.rdc.cmp.alert.dispatcher.util.LogAppender;
import com.sc.rdc.cmp.alert.dispatcher.util.MetaDataConfig;
import com.sc.rdc.cmp.core.util.JsonUtil;
import com.sc.rdc.cmp.core.util.MetaDataUtil;
import com.sc.rdc.cmp.core.util.TemplateUtil;
import com.sc.rdc.cmp.core.web.HttpClientProperty;
import com.sc.rdc.cmp.core.web.WebClientProperty;
import com.sc.rdc.cmp.core.web.WebClientUtil;
import freemarker.template.Configuration;
import org.apache.commons.collections4.MapUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.cxf.jaxrs.client.WebClient;
import jakarta.ws.rs.core.Form;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
/**
 * Gateway class for sending SMS alerts via Cellulant aggregator.
 * <p>
 * This class is responsible for preparing the SMS payload, building the request using FreeMarker templates,
 * and invoking the Cellulant SMS aggregator endpoint. It handles authentication, response parsing,
 * and logging for traceability and audit purposes.
 * </p>
 */
@Component
public class CellulantGateway {
    private static final Logger log = LoggerFactory.getLogger(CellulantGateway.class);
    @Autowired
    private MetaDataConfig metaDataConfig;
    @Autowired
    private Configuration freemarkerConfig;
    @Autowired
    private LogAppender logAppender;
    @Value("${notify.Cellulant.gateway.auth.type:Basic}")
    private String authType;
    @Value("${notify.Cellulant.gateway.referenceNumber.field.name:client_sms_id}")
    private String referenceNumberFieldName;
    @Value("${notify.Cellulant.gateway.status.code.field.name:stat_code}")
    private String statusCodeFieldName;
    @Value("${notify.Cellulant.gateway.success.codes:1}")
    private String[] successStatusCodes;
    @Value("${notify.Cellulant.gateway.success.http.codes:200,201}")
    private int[] successHttpStatusCodes;
    public SmsPayload postSms(SmsPayload smsPayload) {
        try {
            String smsAggregatorSetupKey = StringUtils.join(smsPayload.getCountryCode(), "_", smsPayload.getAggregatorType());
            SmsAggregatorSetup smsAggregatorSetup = MetaDataUtil.getConfig(metaDataConfig.getSmsAggregatorSetupMap(), smsAggregatorSetupKey);
            if (smsAggregatorSetup != null) {
                log.info("Cellulant Details are: {}", smsAggregatorSetup);
                WebClientProperty webClientProperty = WebClientProperty.builder()
                        .mediaType(MediaType.APPLICATION_FORM_URLENCODED)
                        .username(smsAggregatorSetup.getUsername())
                        .password(smsAggregatorSetup.getPassword())
                        .build();
                HttpClientProperty httpClientProperty = HttpClientProperty.builder()
                        .cnCheckDisabled(smsAggregatorSetup.isCnCheckDisabled())
                        .connectionTimeout(smsAggregatorSetup.getConnectionTimeout())
                        .receiveTimeout(smsAggregatorSetup.getReadTimeout())
                        .proxyIp(smsAggregatorSetup.getProxyIP())
                        .proxyPort(smsAggregatorSetup.getProxyPort())
                        .build();
                WebClient webClient = WebClientUtil.create(smsAggregatorSetup.getUrl(), webClientProperty, httpClientProperty);
                String requestBody = smsAggregatorSetup.getRequestTemplate();
                Map<String, Object> paramMap = new HashMap<>();
                paramMap.putAll(JsonUtil.convertValue(smsPayload, new TypeReference<Map<String, Object>>() {
                }));
                paramMap.putAll(JsonUtil.convertValue(smsAggregatorSetup, new TypeReference<Map<String, Object>>() {
                }));
                requestBody = TemplateUtil.processTemplate(freemarkerConfig, requestBody, paramMap);
                log.info("RequestBody Content : {}", requestBody);
                Map<String, String> requestBodyMap = JsonUtil.parseJson(requestBody, new TypeReference<Map<String, String>>() {
                });
                Form requestForm = new Form();
                requestBodyMap.forEach(requestForm::param);
                Response httpResponse = webClient.post(requestForm);
                int statusCode = httpResponse.getStatus();
                log.info("AggregatorResponse statusCode : {}", statusCode);
                smsPayload.setAggregatorStatusCode(String.valueOf(statusCode));
                smsPayload.setAggregatorResponse(StringUtils.trim(httpResponse.readEntity(String.class)));
                log.info("AggregatorResponse :: {} ", smsPayload.getAggregatorResponse());
                if (successHttpStatusCodes != null
                        && smsPayload != null
                        && StringUtils.isNotEmpty(smsPayload.getAggregatorResponse())
                        && Arrays.stream(successHttpStatusCodes).anyMatch(i -> i == statusCode)) {
                    Optional.ofNullable(JsonUtil.parseJson(smsPayload.getAggregatorResponse(), new TypeReference<Map<String, Object>>() {
                            }))
                            .filter(MapUtils::isNotEmpty)
                            .ifPresentOrElse(responseMap -> {
                                smsPayload.setAggregatorReferenceNumber(
                                        Optional.ofNullable(responseMap.get(referenceNumberFieldName))
                                                .map(String::valueOf)
                                                .orElse(null)
                                );
                                smsPayload.setAggregatorStatusCode(
                                        Optional.ofNullable(responseMap.get(statusCodeFieldName))
                                                .map(String::valueOf)
                                                .orElse(null)
                                );
                                log.info("AggregatorResponse : Aggregator Status Code : {}", smsPayload.getAggregatorStatusCode());
                                log.info("AggregatorResponse : Aggregator ReferenceNumber : {}", smsPayload.getAggregatorReferenceNumber());
                                if (successStatusCodes != null &&
                                        Arrays.stream(successStatusCodes)
                                                .anyMatch(code -> smsPayload.getAggregatorStatusCode() != null &&
                                                        smsPayload.getAggregatorStatusCode().equalsIgnoreCase(code))) {
                                    logAppender.setSmsLog(smsPayload.getCountryCode(), smsPayload.getAlertType(), DispatherConstant.SMS_SENT);
                                    smsPayload.setStatus(smsAggregatorSetup.isFinalStatusRequired() ? SmsStatusCode.POST.getValue() : SmsStatusCode.SUCCESS.getValue());
                                } else {
                                    smsPayload.setStatus(SmsStatusCode.FAIL.getValue());
                                }
                            }, () -> smsPayload.setStatus(SmsStatusCode.FAIL.getValue()));
                } else {
                    log.info(DispatherConstant.SMS_FAIL, smsPayload.getCountryCode(), smsPayload.getAlertSubType());
                    smsPayload.setStatus(SmsStatusCode.EXCEPTION.getValue());
                }
                if (StringUtils.isEmpty(smsPayload.getAggregatorResponse())) {
                    smsPayload.setStatus(SmsStatusCode.FAIL.getValue());
                    smsPayload.getErrors().add("Empty Response");
                }
            } else {
                log.error("No Sms Aggregator Setup Found for : {}_{}", smsPayload.getCountryCode(), smsPayload.getAggregatorType());
                smsPayload.setErrorCode(AppErrorCodes.SMS_AGGREGATOR_SETUP_NOT_FOUND);
                smsPayload.getErrors().add(StringUtils.join("No Sms Aggregator Setup Found for ", smsPayload.getCountryCode(), "_", smsPayload.getAggregatorType()));
            }
        } catch (Exception e) {
            log.error("Exception in postSMS() method :{}", e.getMessage(), e);
            log.info(DispatherConstant.SMS_FAIL, smsPayload.getCountryCode(), smsPayload.getAlertSubType());
            smsPayload.setErrorCode(AppErrorCodes.SMS_AGGREGATOR_SEND_ERROR);
            smsPayload.getErrors().add(StringUtils.join("Exception in postSms() method ", e.toString()));
        }
        return smsPayload;
    }
}
