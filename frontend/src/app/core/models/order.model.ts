// Modelos para el sistema Pedidos360

export type EstadoPedido = 'PENDIENTE' | 'EN_PREPARACION' | 'DESPACHADO' | 'ENTREGADO' | 'CANCELADO';
export type PrioridadPedido = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export interface ItemPedido {
  id: string;
  producto: string;
  sku: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Pedido {
  id: string;
  numeroPedido: string;
  clienteNombre: string;
  clienteEmail: string;
  clienteTelefono: string;
  direccionEnvio: string;
  ciudad: string;
  fechaCreacion: string;
  fechaEntregaEstimada?: string;
  estado: EstadoPedido;
  prioridad: PrioridadPedido;
  items: ItemPedido[];
  total: number;
  observaciones?: string;
  canalVenta: 'WEB' | 'PORTAL_CLIENTES' | 'VENTA_TELEFONICA';
}

export interface ResumenEstadisticas {
  totalPedidos: number;
  totalMonto: number;
  pedidosPendientes: number;
  pedidosEnPreparacion: number;
  pedidosDespachados: number;
  pedidosEntregados: number;
  pedidosCancelados: number;
}

export interface FiltrosPedido {
  busqueda: string;
  estado: string;
  prioridad: string;
}
