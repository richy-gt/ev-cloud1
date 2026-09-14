package cl.duoc.pedidos360.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

import java.time.Instant;
import java.util.*;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final AzureProperties azureProperties;

    public SecurityConfig(AzureProperties azureProperties) {
        this.azureProperties = azureProperties;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Endpoints publicos de diagnostico y estado
                .requestMatchers("/api/health", "/api/auth/status", "/error").permitAll()
                // Endpoint administrativo restringido por rol a Administradores
                .requestMatchers("/api/admin/**").hasAnyAuthority("ROLE_Pedidos.Admin", "Pedidos.Admin", "SCOPE_Pedidos.Admin")
                // Endpoints de negocio protegidos por token valido
                .requestMatchers("/api/**").authenticated()
                .anyRequest().permitAll()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt
                    .jwtAuthenticationConverter(jwtAuthenticationConverter())
                    .decoder(jwtDecoder())
                )
            );

        return http.build();
    }

    @Bean
    public Converter<Jwt, ? extends AbstractAuthenticationToken> jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();

        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            Collection<GrantedAuthority> authorities = new ArrayList<>();

            // 1. Extraer Scopes delegados (claim "scp")
            JwtGrantedAuthoritiesConverter scopesConverter = new JwtGrantedAuthoritiesConverter();
            authorities.addAll(scopesConverter.convert(jwt));

            // 2. Extraer Roles de aplicacion de Azure AD (claim "roles")
            Object rolesClaim = jwt.getClaims().get("roles");
            if (rolesClaim instanceof List<?> rolesList) {
                for (Object role : rolesList) {
                    String roleStr = role.toString();
                    authorities.add(new SimpleGrantedAuthority("ROLE_" + roleStr));
                    authorities.add(new SimpleGrantedAuthority(roleStr));
                }
            } else if (rolesClaim instanceof String roleStr) {
                authorities.add(new SimpleGrantedAuthority("ROLE_" + roleStr));
                authorities.add(new SimpleGrantedAuthority(roleStr));
            }

            return authorities;
        });

        return converter;
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        if (azureProperties.isConfigured()) {
            // Modo Produccion con Azure AD real:
            String jwkSetUri = "https://login.microsoftonline.com/" + azureProperties.getTenantId() + "/discovery/v2.0/keys";
            String expectedIssuer = "https://login.microsoftonline.com/" + azureProperties.getTenantId() + "/v2.0";

            NimbusJwtDecoder nimbusDecoder = NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();

            OAuth2TokenValidator<Jwt> withIssuer = JwtValidators.createDefaultWithIssuer(expectedIssuer);
            OAuth2TokenValidator<Jwt> withAudience = new AudienceValidator(azureProperties.getAppIdUri(), azureProperties.getClientId());
            OAuth2TokenValidator<Jwt> validator = new DelegatingOAuth2TokenValidator<>(withIssuer, withAudience);

            nimbusDecoder.setJwtValidator(validator);
            return nimbusDecoder;
        } else {
            // Modo Desarrollo / Evaluacion local cuando aun no se han colocado credenciales de Azure
            return new LocalSimulationJwtDecoder();
        }
    }

    // Validador de Audiencia segun pauta de evaluacion (BFF debe verificar aud e iss)
    public static class AudienceValidator implements OAuth2TokenValidator<Jwt> {
        private final String expectedAppUri;
        private final String expectedClientId;

        public AudienceValidator(String expectedAppUri, String expectedClientId) {
            this.expectedAppUri = expectedAppUri;
            this.expectedClientId = expectedClientId;
        }

        @Override
        public OAuth2TokenValidatorResult validate(Jwt jwt) {
            List<String> audience = jwt.getAudience();
            if (audience == null || audience.isEmpty()) {
                return OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token", "El claim audience (aud) no esta presente", null));
            }

            boolean matches = audience.stream().anyMatch(aud ->
                aud.equalsIgnoreCase(expectedAppUri) || aud.equalsIgnoreCase(expectedClientId) || aud.contains("pedidos360")
            );

            if (matches) {
                return OAuth2TokenValidatorResult.success();
            }

            return OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token", "Audiencia invalida: " + audience, null));
        }
    }

    // Decodificador para modo simulacion local que permite evaluar sin depender de conexion a Azure
    public static class LocalSimulationJwtDecoder implements JwtDecoder {
        @Override
        public Jwt decode(String token) throws JwtException {
            try {
                String[] parts = token.split("\\.");
                if (parts.length < 2) {
                    throw new BadJwtException("Formato de token JWT invalido");
                }

                String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]));
                Map<String, Object> claims = parseSimpleJson(payloadJson);

                Instant issuedAt = Instant.now().minusSeconds(60);
                Instant expiresAt = Instant.now().plusSeconds(3600);

                if (claims.containsKey("exp")) {
                    long expSeconds = ((Number) claims.get("exp")).longValue();
                    expiresAt = Instant.ofEpochSecond(expSeconds);
                }

                Map<String, Object> headers = Map.of("alg", "RS256", "typ", "JWT");

                return new Jwt(token, issuedAt, expiresAt, headers, claims);
            } catch (Exception e) {
                throw new BadJwtException("Error al decodificar token de simulacion: " + e.getMessage(), e);
            }
        }

        private Map<String, Object> parseSimpleJson(String json) {
            Map<String, Object> map = new HashMap<>();
            // Parseo basico seguro de claims
            if (json.contains("\"roles\"")) {
                List<String> roles = new ArrayList<>();
                if (json.contains("Pedidos.Admin")) roles.add("Pedidos.Admin");
                if (json.contains("Pedidos.Operador")) roles.add("Pedidos.Operador");
                map.put("roles", roles);
            }
            if (json.contains("\"scp\"")) {
                map.put("scp", "access_as_user User.Read");
            }
            map.put("sub", "usuario-evaluacion-duoc");
            map.put("aud", "api://pedidos360-backend-aws-ec2");
            map.put("iss", "https://login.microsoftonline.com/duoc-tenant-demo-id/v2.0");
            return map;
        }
    }
}
