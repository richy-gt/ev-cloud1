package cl.duoc.pedidos360.controller;

import cl.duoc.pedidos360.config.AzureProperties;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AuthInfoController {

    private final AzureProperties azureProperties;

    public AuthInfoController(AzureProperties azureProperties) {
        this.azureProperties = azureProperties;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "pedidos360-backend",
                "version", "1.0.0",
                "cloudRuntime", "AWS EC2 / Docker"
        ));
    }

    @GetMapping("/auth/status")
    public ResponseEntity<Map<String, Object>> authStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("azureConfigured", azureProperties.isConfigured());
        status.put("tenantId", azureProperties.getTenantId());
        status.put("clientId", azureProperties.getClientId());
        status.put("appIdUri", azureProperties.getAppIdUri());
        return ResponseEntity.ok(status);
    }

    @GetMapping("/auth/me")
    public ResponseEntity<Map<String, Object>> getUserClaims(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {
            return ResponseEntity.status(401).body(Map.of("error", "No autenticado"));
        }

        Map<String, Object> info = new HashMap<>();
        info.put("subject", jwt.getSubject());
        info.put("audience", jwt.getAudience());
        info.put("issuer", jwt.getIssuer() != null ? jwt.getIssuer().toString() : "null");
        info.put("expiresAt", jwt.getExpiresAt());
        info.put("roles", jwt.getClaims().get("roles"));
        info.put("scopes", jwt.getClaims().get("scp"));
        info.put("allClaims", jwt.getClaims());

        return ResponseEntity.ok(info);
    }
}
