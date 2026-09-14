package cl.duoc.pedidos360.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "azure.activedirectory")
public class AzureProperties {

    private String tenantId = "TU_TENANT_ID_DE_AZURE";
    private String clientId = "TU_BACKEND_CLIENT_ID";
    private String appIdUri = "api://TU_BACKEND_CLIENT_ID";

    public boolean isConfigured() {
        return tenantId != null && !tenantId.isBlank() && !tenantId.contains("TU_TENANT_ID")
                && clientId != null && !clientId.isBlank() && !clientId.contains("TU_BACKEND");
    }

    public String getTenantId() {
        return tenantId;
    }

    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }

    public String getClientId() {
        return clientId;
    }

    public void setClientId(String clientId) {
        this.clientId = clientId;
    }

    public String getAppIdUri() {
        return appIdUri;
    }

    public void setAppIdUri(String appIdUri) {
        this.appIdUri = appIdUri;
    }
}
