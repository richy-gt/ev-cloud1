package cl.duoc.pedidos360.service;

import cl.duoc.pedidos360.entity.ItemPedidoEntity;
import cl.duoc.pedidos360.entity.PedidoEntity;
import cl.duoc.pedidos360.repository.PedidoRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;

    public PedidoService(PedidoRepository pedidoRepository) {
        this.pedidoRepository = pedidoRepository;
    }

    @PostConstruct
    public void seedInitialData() {
        if (pedidoRepository.count() == 0) {
            PedidoEntity p1 = new PedidoEntity();
            p1.setId("ped-001");
            p1.setNumeroPedido("PED-2025-001");
            p1.setClienteNombre("Distribuidora Los Andes SpA");
            p1.setClienteEmail("contacto@losandes.cl");
            p1.setClienteTelefono("+56 9 8765 4321");
            p1.setDireccionEnvio("Av. Providencia 1245, Oficina 402");
            p1.setCiudad("Santiago");
            p1.setFechaCreacion("2025-03-10T14:30:00Z");
            p1.setFechaEntregaEstimada("2025-03-15T18:00:00Z");
            p1.setEstado("EN_PREPARACION");
            p1.setPrioridad("ALTA");
            p1.setCanalVenta("PORTAL_CLIENTES");
            p1.setObservaciones("Entregar en horario de oficina. Solicitar confirmacion previa.");
            p1.setTotal(3780000.0);
            p1.addItem(new ItemPedidoEntity("it-1", "Servidor Blade Xeon 64GB", "SRV-X64-01", 2, 1450000.0, 2900000.0));
            p1.addItem(new ItemPedidoEntity("it-2", "Switch Gestionable 24 Puertos Gigabit", "NET-SW24-G", 4, 220000.0, 880000.0));
            pedidoRepository.save(p1);

            PedidoEntity p2 = new PedidoEntity();
            p2.setId("ped-002");
            p2.setNumeroPedido("PED-2025-002");
            p2.setClienteNombre("Tecnologia y Servicios Biobio Ltda.");
            p2.setClienteEmail("adquisiciones@tsbiobio.cl");
            p2.setClienteTelefono("+56 41 234 5678");
            p2.setDireccionEnvio("Calle Barros Arana 540");
            p2.setCiudad("Concepcion");
            p2.setFechaCreacion("2025-03-11T09:15:00Z");
            p2.setFechaEntregaEstimada("2025-03-14T12:00:00Z");
            p2.setEstado("DESPACHADO");
            p2.setPrioridad("MEDIA");
            p2.setCanalVenta("WEB");
            p2.setObservaciones("Despacho via Starken con numero de seguimiento.");
            p2.setTotal(1035000.0);
            p2.addItem(new ItemPedidoEntity("it-3", "Punto de Acceso Wi-Fi 6 Enterprise", "WIFI-AP6-ENT", 6, 135000.0, 810000.0));
            p2.addItem(new ItemPedidoEntity("it-4", "Cable UTP Cat6 Bobina 305m", "CAB-UTP-C6", 3, 75000.0, 225000.0));
            pedidoRepository.save(p2);

            PedidoEntity p3 = new PedidoEntity();
            p3.setId("ped-003");
            p3.setNumeroPedido("PED-2025-003");
            p3.setClienteNombre("Clinica Metropolitana Norte");
            p3.setClienteEmail("informatica@clinicamnorte.cl");
            p3.setClienteTelefono("+56 2 2987 1122");
            p3.setDireccionEnvio("Av. Independencia 1800");
            p3.setCiudad("Santiago");
            p3.setFechaCreacion("2025-03-12T16:45:00Z");
            p3.setFechaEntregaEstimada("2025-03-16T15:00:00Z");
            p3.setEstado("PENDIENTE");
            p3.setPrioridad("CRITICA");
            p3.setCanalVenta("VENTA_TELEFONICA");
            p3.setObservaciones("Instalacion requerida en sala de servidores piso 2.");
            p3.setTotal(3930000.0);
            p3.addItem(new ItemPedidoEntity("it-5", "UPS Online 3kVA Rackeable", "UPS-ON-3K", 3, 890000.0, 2670000.0));
            p3.addItem(new ItemPedidoEntity("it-6", "Modulo de Baterias Externas para UPS", "BAT-EXT-3K", 3, 420000.0, 1260000.0));
            pedidoRepository.save(p3);
        }
    }

    public List<PedidoEntity> getAllPedidos() {
        return pedidoRepository.findAllByOrderByFechaCreacionDesc();
    }

    public Optional<PedidoEntity> getPedidoById(String id) {
        return pedidoRepository.findById(id).or(() -> pedidoRepository.findByNumeroPedido(id));
    }

    @Transactional
    public PedidoEntity createPedido(PedidoEntity nuevo) {
        long count = pedidoRepository.count() + 1;
        String nextId = "ped-" + String.format("%03d", count);
        String nextNum = "PED-2025-" + String.format("%03d", count);

        if (nuevo.getId() == null || nuevo.getId().isBlank()) {
            nuevo.setId(nextId);
        }
        if (nuevo.getNumeroPedido() == null || nuevo.getNumeroPedido().isBlank()) {
            nuevo.setNumeroPedido(nextNum);
        }
        if (nuevo.getFechaCreacion() == null || nuevo.getFechaCreacion().isBlank()) {
            nuevo.setFechaCreacion(Instant.now().toString());
        }
        if (nuevo.getEstado() == null || nuevo.getEstado().isBlank()) {
            nuevo.setEstado("PENDIENTE");
        }

        if (nuevo.getItems() != null) {
            int itemIdx = 1;
            for (ItemPedidoEntity item : nuevo.getItems()) {
                if (item.getId() == null || item.getId().isBlank()) {
                    item.setId(nuevo.getId() + "-it-" + itemIdx++);
                }
                item.setPedido(nuevo);
            }
        }

        return pedidoRepository.save(nuevo);
    }

    @Transactional
    public Optional<PedidoEntity> updateEstado(String id, String nuevoEstado) {
        return getPedidoById(id).map(pedido -> {
            pedido.setEstado(nuevoEstado);
            return pedidoRepository.save(pedido);
        });
    }

    public Map<String, Object> getEstadisticas() {
        List<PedidoEntity> todos = pedidoRepository.findAll();
        double totalMonto = todos.stream().mapToDouble(PedidoEntity::getTotal).sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalPedidos", todos.size());
        stats.put("totalMonto", totalMonto);
        stats.put("pedidosPendientes", pedidoRepository.countByEstado("PENDIENTE"));
        stats.put("pedidosEnPreparacion", pedidoRepository.countByEstado("EN_PREPARACION"));
        stats.put("pedidosDespachados", pedidoRepository.countByEstado("DESPACHADO"));
        stats.put("pedidosEntregados", pedidoRepository.countByEstado("ENTREGADO"));
        stats.put("pedidosCancelados", pedidoRepository.countByEstado("CANCELADO"));

        return stats;
    }
}
