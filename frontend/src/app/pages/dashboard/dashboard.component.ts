import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { Pedido, ResumenEstadisticas } from '../../core/models/order.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-container">
      <!-- Encabezado de la vista -->
      <div class="page-header">
        <div>
          <h1>Panel de Control Pedidos360</h1>
          <p>Supervision de pedidos en tiempo real y estado de servicios en la nube</p>
        </div>
        <div class="header-actions">
          <a routerLink="/pedidos/nuevo" class="btn btn-primary">
            <svg class="icon-svg" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Nuevo Pedido</span>
          </a>
        </div>
      </div>

      <!-- Tarjetas de Resumen Metrico -->
      <div class="metrics-grid" *ngIf="stats$ | async as stats">
        <div class="metric-card card">
          <div class="metric-icon-box blue">
            <svg class="icon-svg" viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
            </svg>
          </div>
          <div class="metric-data">
            <span class="metric-label">Total Pedidos</span>
            <span class="metric-value">{{ stats.totalPedidos }}</span>
          </div>
        </div>

        <div class="metric-card card">
          <div class="metric-icon-box green">
            <svg class="icon-svg" viewBox="0 0 24 24">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div class="metric-data">
            <span class="metric-label">Monto Total</span>
            <span class="metric-value">{{ stats.totalMonto | currency:'CLP':'symbol-narrow':'1.0-0' }}</span>
          </div>
        </div>

        <div class="metric-card card">
          <div class="metric-icon-box amber">
            <svg class="icon-svg" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div class="metric-data">
            <span class="metric-label">En Preparacion</span>
            <span class="metric-value">{{ stats.pedidosEnPreparacion }}</span>
          </div>
        </div>

        <div class="metric-card card">
          <div class="metric-icon-box indigo">
            <svg class="icon-svg" viewBox="0 0 24 24">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
          </div>
          <div class="metric-data">
            <span class="metric-label">Despachados</span>
            <span class="metric-value">{{ stats.pedidosDespachados }}</span>
          </div>
        </div>

        <div class="metric-card card">
          <div class="metric-icon-box teal">
            <svg class="icon-svg" viewBox="0 0 24 24">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div class="metric-data">
            <span class="metric-label">Entregados</span>
            <span class="metric-value">{{ stats.pedidosEntregados }}</span>
          </div>
        </div>
      </div>

      <!-- Diagrama de Arquitectura Cloud Native -->
      <div class="arch-card card">
        <div class="card-header">
          <h2 class="card-title">Arquitectura del Sistema Pedidos360 (DSY1107)</h2>
          <span class="badge badge-preparacion">Cloud Native I</span>
        </div>
        <div class="arch-flow">
          <div class="arch-step">
            <div class="arch-step-badge">1. Frontend</div>
            <strong>Angular 19/22</strong>
            <p>MSAL Angular + Guards + Interceptor</p>
          </div>
          <div class="arch-connector">
            <span>Bearer JWT</span>
            <div class="arrow-line"></div>
          </div>
          <div class="arch-step highlight">
            <div class="arch-step-badge">2. Gateway</div>
            <strong>AWS API Gateway / BFF</strong>
            <p>Validacion Issuer, Audience y Firma</p>
          </div>
          <div class="arch-connector">
            <span>Proxy HTTP</span>
            <div class="arrow-line"></div>
          </div>
          <div class="arch-step">
            <div class="arch-step-badge">3. Backend</div>
            <strong>Spring Boot en EC2</strong>
            <p>Microservicios de Pedidos y Logistica</p>
          </div>
          <div class="arch-connector">
            <span>JPA / JDBC</span>
            <div class="arrow-line"></div>
          </div>
          <div class="arch-step">
            <div class="arch-step-badge">4. Base de Datos</div>
            <strong>Cloud SQL / RDS</strong>
            <p>Persistencia relacional segura</p>
          </div>
        </div>
      </div>

      <!-- Pedidos Recientes -->
      <div class="card recent-orders-card">
        <div class="card-header">
          <div>
            <h2 class="card-title">Pedidos Recientes</h2>
            <p>Ultimos registros ingresados al sistema</p>
          </div>
          <a routerLink="/pedidos" class="btn btn-outline btn-sm">
            Ver Todos los Pedidos
          </a>
        </div>

        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Numero Pedido</th>
                <th>Cliente</th>
                <th>Ciudad</th>
                <th>Fecha</th>
                <th>Prioridad</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of recentOrders$ | async">
                <td>
                  <strong class="order-id-link">{{ p.numeroPedido }}</strong>
                </td>
                <td>{{ p.clienteNombre }}</td>
                <td>{{ p.ciudad }}</td>
                <td>{{ p.fechaCreacion | date:'dd/MM/yyyy HH:mm' }}</td>
                <td>
                  <span class="badge" [ngClass]="getPriorityClass(p.prioridad)">
                    {{ p.prioridad }}
                  </span>
                </td>
                <td>
                  <strong>{{ p.total | currency:'CLP':'symbol-narrow':'1.0-0' }}</strong>
                </td>
                <td>
                  <span class="badge" [ngClass]="getStatusClass(p.estado)">
                    {{ p.estado.replace('_', ' ') }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
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

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 18px;
      margin-bottom: 28px;
    }

    .metric-card {
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .metric-icon-box {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .metric-icon-box.blue { background-color: rgba(37, 99, 235, 0.15); color: #3b82f6; }
    .metric-icon-box.green { background-color: rgba(16, 185, 129, 0.15); color: #10b981; }
    .metric-icon-box.amber { background-color: rgba(245, 158, 11, 0.15); color: #f59e0b; }
    .metric-icon-box.indigo { background-color: rgba(99, 102, 241, 0.15); color: #818cf8; }
    .metric-icon-box.teal { background-color: rgba(20, 184, 166, 0.15); color: #14b8a6; }

    .metric-data {
      display: flex;
      flex-direction: column;
    }

    .metric-label {
      font-size: 0.78rem;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .metric-value {
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .arch-card {
      margin-bottom: 28px;
    }

    .arch-flow {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      overflow-x: auto;
      padding: 12px 0;
    }

    .arch-step {
      background-color: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 16px;
      min-width: 190px;
      flex: 1;
      text-align: center;
      position: relative;
    }

    .arch-step.highlight {
      border-color: rgba(59, 130, 246, 0.4);
      background-color: rgba(37, 99, 235, 0.08);
    }

    .arch-step-badge {
      display: inline-block;
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      color: #60a5fa;
      background-color: rgba(59, 130, 246, 0.15);
      padding: 2px 8px;
      border-radius: var(--radius-full);
      margin-bottom: 6px;
    }

    .arch-step strong {
      display: block;
      font-size: 0.95rem;
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .arch-step p {
      font-size: 0.75rem;
      margin: 0;
      color: var(--text-secondary);
    }

    .arch-connector {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      font-size: 0.68rem;
      font-family: var(--font-mono);
      color: var(--text-muted);
      flex-shrink: 0;
    }

    .arrow-line {
      width: 32px;
      height: 2px;
      background-color: rgba(255, 255, 255, 0.2);
      position: relative;
    }

    .arrow-line::after {
      content: '';
      position: absolute;
      right: 0;
      top: -3px;
      width: 0;
      height: 0;
      border-top: 4px solid transparent;
      border-bottom: 4px solid transparent;
      border-left: 6px solid rgba(255, 255, 255, 0.4);
    }

    .recent-orders-card {
      padding: 24px;
    }

    .order-id-link {
      color: #60a5fa;
      font-family: var(--font-mono);
      font-size: 0.85rem;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  public readonly authService = inject(AuthService);

  public stats$: Observable<ResumenEstadisticas> = this.orderService.getEstadisticas();
  public recentOrders$: Observable<Pedido[]> = this.orderService.pedidos$;

  ngOnInit(): void {
    this.orderService.getPedidos().subscribe();
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
