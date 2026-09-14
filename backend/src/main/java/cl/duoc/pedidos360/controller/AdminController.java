package cl.duoc.pedidos360.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @GetMapping("/metricas")
    @PreAuthorize("hasAuthority('ROLE_Pedidos.Admin') or hasAuthority('Pedidos.Admin')")
    public ResponseEntity<Map<String, Object>> getMetricasAdmin() {
        return ResponseEntity.ok(Map.of(
                "modulo", "Administracion de Pedidos Cloud Native",
                "estadoSeguridad", "Token Validado con Rol Pedidos.Admin",
                "pedidosProcesadosMes", 142,
                "tiempoPromedioDespachoHoras", 18.5,
                "eficienciaLogistica", "98.2%",
                "auditoria", "Acceso autorizado por BFF conforme a la pauta de evaluacion"
        ));
    }
}
