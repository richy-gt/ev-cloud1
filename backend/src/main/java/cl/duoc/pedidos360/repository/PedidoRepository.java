package cl.duoc.pedidos360.repository;

import cl.duoc.pedidos360.entity.PedidoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PedidoRepository extends JpaRepository<PedidoEntity, String> {

    Optional<PedidoEntity> findByNumeroPedido(String numeroPedido);

    List<PedidoEntity> findByEstado(String estado);

    List<PedidoEntity> findByClienteNombreContainingIgnoreCase(String clienteNombre);

    List<PedidoEntity> findAllByOrderByFechaCreacionDesc();

    long countByEstado(String estado);
}
