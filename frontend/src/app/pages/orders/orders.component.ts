import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { EstadoPedido, Pedido } from '../../core/models/order.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Gestion de Pedidos</h1>
          <p>Administracion y seguimiento de envios corporativos en Pedidos360</p>
        </div>
        <div class="header-actions">
          <a routerLink="/pedidos/nuevo" class="btn btn-primary">
            <svg class="icon-svg" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Crear Pedido</span>
          </a>
        </div>
      </div>

      <!-- Filtros y Busqueda -->
      <div class="filter-bar card">
        <div class="search-input-wrapper">
          <svg class="icon-svg search-icon" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            class="form-control search-input"
            placeholder="Buscar por cliente, numero de pedido o ciudad..."
            [(ngModel)]="searchQuery"
          />
        </div>

        <div class="status-filter-group">
          <button
            class="filter-pill"
            [class.active]="selectedStatus === 'TODOS'"
            (click)="selectedStatus = 'TODOS'"
          >
            Todos
          </button>
          <button
            class="filter-pill"
            [class.active]="selectedStatus === 'PENDIENTE'"
            (click)="selectedStatus = 'PENDIENTE'"
          >
            Pendientes
          </button>
          <button
            class="filter-pill"
            [class.active]="selectedStatus === 'EN_PREPARACION'"
            (click)="selectedStatus = 'EN_PREPARACION'"
          >
            En Preparacion
          </button>
          <button
            class="filter-pill"
            [class.active]="selectedStatus === 'DESPACHADO'"
            (click)="selectedStatus = 'DESPACHADO'"
          >
            Despachados
          </button>
          <button
            class="filter-pill"
            [class.active]="selectedStatus === 'ENTREGADO'"
            (click)="selectedStatus = 'ENTREGADO'"
          >
            Entregados
          </button>
        </div>
      </div>

      <!-- Tabla de Pedidos -->
      <div class="card orders-table-card">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Numero Pedido</th>
                <th>Cliente</th>
                <th>Ciudad / Destino</th>
                <th>Fecha Ingreso</th>
                <th>Prioridad</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let order of filteredOrders">
                <td>
                  <span class="order-code">{{ order.numeroPedido }}</span>
                </td>
                <td>
                  <div class="client-cell">
                    <strong>{{ order.clienteNombre }}</strong>
                    <span class="client-email">{{ order.clienteEmail }}</span>
                  </div>
                </td>
                <td>{{ order.ciudad }}</td>
                <td>{{ order.fechaCreacion | date:'dd/MM/yyyy' }}</td>
                <td>
                  <span class="badge" [ngClass]="getPriorityClass(order.prioridad)">
                    {{ order.prioridad }}
                  </span>
                </td>
                <td>
                  <strong>{{ order.total | currency:'CLP':'symbol-narrow':'1.0-0' }}</strong>
                </td>
                <td>
                  <span class="badge" [ngClass]="getStatusClass(order.estado)">
                    {{ order.estado.replace('_', ' ') }}
                  </span>
                </td>
                <td>
                  <button (click)="openDetailModal(order)" class="btn btn-outline btn-sm">
                    Ver Detalle
                  </button>
                </td>
              </tr>
              <tr *ngIf="filteredOrders.length === 0">
                <td colspan="8" class="empty-state">
                  No se encontraron pedidos que coincidan con los criterios de busqueda.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal de Detalle de Pedido -->
      <div class="modal-overlay" *ngIf="selectedOrder">
        <div class="modal-content card">
          <div class="modal-header">
            <div>
              <span class="badge" [ngClass]="getStatusClass(selectedOrder.estado)">
                {{ selectedOrder.estado.replace('_', ' ') }}
              </span>
              <h2>Detalle del Pedido {{ selectedOrder.numeroPedido }}</h2>
              <p>Fecha: {{ selectedOrder.fechaCreacion | date:'dd/MM/yyyy HH:mm' }}</p>
            </div>
            <button (click)="selectedOrder = null" class="btn btn-outline btn-sm">
              Cerrar
            </button>
          </div>

          <div class="modal-body">
            <!-- Datos del Cliente -->
            <div class="detail-section">
              <h3>Informacion del Cliente y Despacho</h3>
              <div class="info-grid">
                <div>
                  <span class="label">Cliente:</span>
                  <strong>{{ selectedOrder.clienteNombre }}</strong>
                </div>
                <div>
                  <span class="label">Correo:</span>
                  <span>{{ selectedOrder.clienteEmail }}</span>
                </div>
                <div>
                  <span class="label">Telefono:</span>
                  <span>{{ selectedOrder.clienteTelefono }}</span>
                </div>
                <div>
                  <span class="label">Direccion:</span>
                  <span>{{ selectedOrder.direccionEnvio }}, {{ selectedOrder.ciudad }}</span>
                </div>
                <div>
                  <span class="label">Canal de Venta:</span>
                  <span>{{ selectedOrder.canalVenta }}</span>
                </div>
                <div>
                  <span class="label">Prioridad:</span>
                  <span class="badge" [ngClass]="getPriorityClass(selectedOrder.prioridad)">
                    {{ selectedOrder.prioridad }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Tabla de Articulos -->
            <div class="detail-section">
              <h3>Articulos del Pedido</h3>
              <table class="table modal-items-table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio Unitario</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let it of selectedOrder.items">
                    <td><code>{{ it.sku }}</code></td>
                    <td>{{ it.producto }}</td>
                    <td>{{ it.cantidad }}</td>
                    <td>{{ it.precioUnitario | currency:'CLP':'symbol-narrow':'1.0-0' }}</td>
                    <td><strong>{{ it.subtotal | currency:'CLP':'symbol-narrow':'1.0-0' }}</strong></td>
                  </tr>
                </tbody>
              </table>
              <div class="total-row">
                <span>Total General:</span>
                <strong>{{ selectedOrder.total | currency:'CLP':'symbol-narrow':'1.0-0' }}</strong>
              </div>
            </div>

            <!-- Cambio de Estado -->
            <div class="detail-section change-status-box">
              <h3>Actualizar Estado del Pedido</h3>
              <div class="status-actions">
                <button
                  class="btn btn-sm"
                  [class.btn-primary]="selectedOrder.estado === 'PENDIENTE'"
                  [class.btn-secondary]="selectedOrder.estado !== 'PENDIENTE'"
                  (click)="updateOrderStatus(selectedOrder.id, 'PENDIENTE')"
                >
                  Pendiente
                </button>
                <button
                  class="btn btn-sm"
                  [class.btn-primary]="selectedOrder.estado === 'EN_PREPARACION'"
                  [class.btn-secondary]="selectedOrder.estado !== 'EN_PREPARACION'"
                  (click)="updateOrderStatus(selectedOrder.id, 'EN_PREPARACION')"
                >
                  En Preparacion
                </button>
                <button
                  class="btn btn-sm"
                  [class.btn-primary]="selectedOrder.estado === 'DESPACHADO'"
                  [class.btn-secondary]="selectedOrder.estado !== 'DESPACHADO'"
                  (click)="updateOrderStatus(selectedOrder.id, 'DESPACHADO')"
                >
                  Despachado
                </button>
                <button
                  class="btn btn-sm"
                  [class.btn-primary]="selectedOrder.estado === 'ENTREGADO'"
                  [class.btn-secondary]="selectedOrder.estado !== 'ENTREGADO'"
                  (click)="updateOrderStatus(selectedOrder.id, 'ENTREGADO')"
                >
                  Entregado
                </button>
                <button
                  class="btn btn-danger btn-sm"
                  (click)="updateOrderStatus(selectedOrder.id, 'CANCELADO')"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .filter-bar {
      margin-bottom: 24px;
      padding: 16px 20px;
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: center;
      justify-content: space-between;
    }

    .search-input-wrapper {
      position: relative;
      flex: 1;
      min-width: 280px;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
    }

    .search-input {
      padding-left: 38px;
    }

    .status-filter-group {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .filter-pill {
      background-color: var(--bg-surface-elevated);
      border: 1px solid var(--border-subtle);
      color: var(--text-secondary);
      padding: 6px 14px;
      border-radius: var(--radius-full);
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .filter-pill:hover {
      color: var(--text-primary);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .filter-pill.active {
      background-color: var(--color-primary);
      border-color: var(--color-primary);
      color: #ffffff;
    }

    .order-code {
      font-family: var(--font-mono);
      color: #60a5fa;
      font-weight: 600;
      font-size: 0.85rem;
    }

    .client-cell {
      display: flex;
      flex-direction: column;
    }

    .client-email {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      color: var(--text-muted);
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      padding: 20px;
    }

    .modal-content {
      max-width: 760px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      padding: 28px;
      background-color: var(--bg-surface);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: 16px;
    }

    .modal-body {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .detail-section h3 {
      font-size: 0.95rem;
      color: #cbd5e1;
      margin-bottom: 12px;
      border-left: 3px solid var(--color-primary);
      padding-left: 8px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      background-color: rgba(0, 0, 0, 0.2);
      padding: 16px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
    }

    .info-grid .label {
      display: block;
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .modal-items-table {
      margin-bottom: 12px;
    }

    .total-row {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 12px;
      font-size: 1.1rem;
      padding-top: 10px;
      border-top: 1px solid var(--border-subtle);
    }

    .change-status-box {
      background-color: rgba(255, 255, 255, 0.02);
      padding: 16px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
    }

    .status-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
  `]
})
export class OrdersComponent implements OnInit {
  private readonly orderService = inject(OrderService);

  public allOrders: Pedido[] = [];
  public searchQuery = '';
  public selectedStatus = 'TODOS';
  public selectedOrder: Pedido | null = null;

  ngOnInit(): void {
    this.orderService.pedidos$.subscribe((data) => {
      this.allOrders = data;
    });
    this.orderService.getPedidos().subscribe();
  }

  public get filteredOrders(): Pedido[] {
    return this.allOrders.filter((p) => {
      const matchesStatus =
        this.selectedStatus === 'TODOS' || p.estado === this.selectedStatus;

      const q = this.searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.numeroPedido.toLowerCase().includes(q) ||
        p.clienteNombre.toLowerCase().includes(q) ||
        p.ciudad.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }

  public openDetailModal(order: Pedido): void {
    this.selectedOrder = order;
  }

  public updateOrderStatus(id: string, nuevoEstado: EstadoPedido): void {
    this.orderService.updateEstado(id, nuevoEstado).subscribe((updated) => {
      if (updated && this.selectedOrder?.id === id) {
        this.selectedOrder = updated;
      }
    });
  }

  public getStatusClass(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return 'badge-pendiente';
      case 'EN_PREPARACION': return 'badge-preparacion';
      case 'DESPACHADO': return 'badge-despachado';
      case 'ENTREGADO': return 'badge-entregado';
      case 'CANCELADO': return 'badge-cancelado';
      default: return '';
    }
  }

  public getPriorityClass(prioridad: string): string {
    switch (prioridad) {
      case 'CRITICA':
      case 'ALTA': return 'badge-alta';
      case 'MEDIA': return 'badge-media';
      case 'BAJA': return 'badge-baja';
      default: return '';
    }
  }
}
