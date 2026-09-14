// Servicio para administracion de pedidos en Pedidos360
// Realiza peticiones HTTP que son interceptadas por MsalInterceptor para inyectar el Bearer Token

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EstadoPedido, Pedido, ResumenEstadisticas } from '../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.api.baseUrl;

  // Datos de prueba iniciales para garantizar vistas 100% operativas
  private readonly mockPedidos: Pedido[] = [
    {
      id: 'ped-001',
      numeroPedido: 'PED-2025-001',
      clienteNombre: 'Distribuidora Los Andes SpA',
      clienteEmail: 'contacto@losandes.cl',
      clienteTelefono: '+56 9 8765 4321',
      direccionEnvio: 'Av. Providencia 1245, Oficina 402',
      ciudad: 'Santiago',
      fechaCreacion: '2025-03-10T14:30:00Z',
      fechaEntregaEstimada: '2025-03-15T18:00:00Z',
      estado: 'EN_PREPARACION',
      prioridad: 'ALTA',
      items: [
        { id: 'it-1', producto: 'Servidor Blade Xeon 64GB', sku: 'SRV-X64-01', cantidad: 2, precioUnitario: 1450000, subtotal: 2900000 },
        { id: 'it-2', producto: 'Switch Gestionable 24 Puertos Gigabit', sku: 'NET-SW24-G', cantidad: 4, precioUnitario: 220000, subtotal: 880000 },
      ],
      total: 3780000,
      observaciones: 'Entregar en horario de oficina. Solicitar confirmacion previa.',
      canalVenta: 'PORTAL_CLIENTES',
    },
    {
      id: 'ped-002',
      numeroPedido: 'PED-2025-002',
      clienteNombre: 'Tecnologia y Servicios Biobio Ltda.',
      clienteEmail: 'adquisiciones@tsbiobio.cl',
      clienteTelefono: '+56 41 234 5678',
      direccionEnvio: 'Calle Barros Arana 540',
      ciudad: 'Concepcion',
      fechaCreacion: '2025-03-11T09:15:00Z',
      fechaEntregaEstimada: '2025-03-14T12:00:00Z',
      estado: 'DESPACHADO',
      prioridad: 'MEDIA',
      items: [
        { id: 'it-3', producto: 'Punto de Acceso Wi-Fi 6 Enterprise', sku: 'WIFI-AP6-ENT', cantidad: 6, precioUnitario: 135000, subtotal: 810000 },
        { id: 'it-4', producto: 'Cable UTP Cat6 Bobina 305m', sku: 'CAB-UTP-C6', cantidad: 3, precioUnitario: 75000, subtotal: 225000 },
      ],
      total: 1035000,
      observaciones: 'Despacho via Starken con numero de seguimiento.',
      canalVenta: 'WEB',
    },
    {
      id: 'ped-003',
      numeroPedido: 'PED-2025-003',
      clienteNombre: 'Clinica Metropolitana Norte',
      clienteEmail: 'informatica@clinicamnorte.cl',
      clienteTelefono: '+56 2 2987 1122',
      direccionEnvio: 'Av. Independencia 1800',
      ciudad: 'Santiago',
      fechaCreacion: '2025-03-12T16:45:00Z',
      fechaEntregaEstimada: '2025-03-16T15:00:00Z',
      estado: 'PENDIENTE',
      prioridad: 'CRITICA',
      items: [
        { id: 'it-5', producto: 'UPS Online 3kVA Rackeable', sku: 'UPS-ON-3K', cantidad: 3, precioUnitario: 890000, subtotal: 2670000 },
        { id: 'it-6', producto: 'Modulo de Baterias Externas para UPS', sku: 'BAT-EXT-3K', cantidad: 3, precioUnitario: 420000, subtotal: 1260000 },
      ],
      total: 3930000,
      observaciones: 'Instalacion requerida en sala de servidores piso 2.',
      canalVenta: 'VENTA_TELEFONICA',
    },
    {
      id: 'ped-004',
      numeroPedido: 'PED-2025-004',
      clienteNombre: 'Retail del Sur S.A.',
      clienteEmail: 'compras@retailsur.cl',
      clienteTelefono: '+56 65 243 9000',
      direccionEnvio: 'Ruta 5 Sur km 1024',
      ciudad: 'Puerto Montt',
      fechaCreacion: '2025-03-08T11:20:00Z',
      fechaEntregaEstimada: '2025-03-12T17:00:00Z',
      estado: 'ENTREGADO',
      prioridad: 'MEDIA',
      items: [
        { id: 'it-7', producto: 'Lector Codigo de Barras 2D Inalambrico', sku: 'SCAN-2D-WL', cantidad: 10, precioUnitario: 65000, subtotal: 650000 },
        { id: 'it-8', producto: 'Impresora Termica de Etiquetas', sku: 'IMP-TERM-4', cantidad: 2, precioUnitario: 180000, subtotal: 360000 },
      ],
      total: 1010000,
      observaciones: 'Recibido conforme en bodega central.',
      canalVenta: 'PORTAL_CLIENTES',
    },
    {
      id: 'ped-005',
      numeroPedido: 'PED-2025-005',
      clienteNombre: 'Colegio San Cristobal',
      clienteEmail: 'soporte@colegiosancristobal.cl',
      clienteTelefono: '+56 2 2456 7890',
      direccionEnvio: 'Av. El Bosque 900',
      ciudad: 'Santiago',
      fechaCreacion: '2025-03-09T10:00:00Z',
      estado: 'CANCELADO',
      prioridad: 'BAJA',
      items: [
        { id: 'it-9', producto: 'Tablet Educativa 10 Pulgadas 64GB', sku: 'TAB-EDU-10', cantidad: 15, precioUnitario: 95000, subtotal: 1425000 },
      ],
      total: 1425000,
      observaciones: 'Pedido cancelado por reasignacion presupuestaria del cliente.',
      canalVenta: 'WEB',
    },
  ];

  private readonly pedidosSubject = new BehaviorSubject<Pedido[]>(this.mockPedidos);
  public readonly pedidos$ = this.pedidosSubject.asObservable();

  // Obtener listado de pedidos (intenta API Gateway y respalda en memoria)
  public getPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.apiUrl}/pedidos`).pipe(
      tap((remote) => {
        if (Array.isArray(remote) && remote.length > 0) {
          this.pedidosSubject.next(remote);
        }
      }),
      catchError(() => {
        // En caso de que el backend en AWS EC2 o Spring Boot aun este en despliegue
        return of(this.pedidosSubject.value);
      })
    );
  }

  // Obtener un pedido por ID
  public getPedidoById(id: string): Observable<Pedido | undefined> {
    return this.http.get<Pedido>(`${this.apiUrl}/pedidos/${id}`).pipe(
      catchError(() => {
        const found = this.pedidosSubject.value.find((p) => p.id === id || p.numeroPedido === id);
        return of(found);
      })
    );
  }

  // Crear un nuevo pedido
  public createPedido(nuevo: Omit<Pedido, 'id' | 'numeroPedido' | 'fechaCreacion'>): Observable<Pedido> {
    const nextIndex = this.pedidosSubject.value.length + 1;
    const formattedId = `ped-${String(nextIndex).padStart(3, '0')}`;
    const formattedNumber = `PED-2025-${String(nextIndex).padStart(3, '0')}`;

    const pedidoCompleto: Pedido = {
      ...nuevo,
      id: formattedId,
      numeroPedido: formattedNumber,
      fechaCreacion: new Date().toISOString(),
    };

    return this.http.post<Pedido>(`${this.apiUrl}/pedidos`, pedidoCompleto).pipe(
      catchError(() => {
        // Guardar localmente
        const current = this.pedidosSubject.value;
        const updated = [pedidoCompleto, ...current];
        this.pedidosSubject.next(updated);
        return of(pedidoCompleto);
      }),
      tap((res) => {
        const current = this.pedidosSubject.value.filter((p) => p.id !== res.id);
        this.pedidosSubject.next([res, ...current]);
      })
    );
  }

  // Actualizar estado de un pedido
  public updateEstado(id: string, nuevoEstado: EstadoPedido): Observable<Pedido | undefined> {
    const current = this.pedidosSubject.value;
    const target = current.find((p) => p.id === id);
    if (!target) return of(undefined);

    const updatedPedido: Pedido = { ...target, estado: nuevoEstado };

    return this.http.patch<Pedido>(`${this.apiUrl}/pedidos/${id}/estado`, { estado: nuevoEstado }).pipe(
      catchError(() => {
        const updatedList = current.map((p) => (p.id === id ? updatedPedido : p));
        this.pedidosSubject.next(updatedList);
        return of(updatedPedido);
      }),
      tap((res) => {
        if (res) {
          const updatedList = current.map((p) => (p.id === id ? res : p));
          this.pedidosSubject.next(updatedList);
        }
      })
    );
  }

  // Obtener resumen estadistico para el dashboard
  public getEstadisticas(): Observable<ResumenEstadisticas> {
    return this.pedidos$.pipe(
      map((pedidos) => {
        const totalPedidos = pedidos.length;
        const totalMonto = pedidos.reduce((acc, curr) => acc + curr.total, 0);
        const pedidosPendientes = pedidos.filter((p) => p.estado === 'PENDIENTE').length;
        const pedidosEnPreparacion = pedidos.filter((p) => p.estado === 'EN_PREPARACION').length;
        const pedidosDespachados = pedidos.filter((p) => p.estado === 'DESPACHADO').length;
        const pedidosEntregados = pedidos.filter((p) => p.estado === 'ENTREGADO').length;
        const pedidosCancelados = pedidos.filter((p) => p.estado === 'CANCELADO').length;

        return {
          totalPedidos,
          totalMonto,
          pedidosPendientes,
          pedidosEnPreparacion,
          pedidosDespachados,
          pedidosEntregados,
          pedidosCancelados,
        };
      })
    );
  }
}
