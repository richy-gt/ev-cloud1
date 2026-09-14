import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { ItemPedido, PrioridadPedido } from '../../core/models/order.model';

@Component({
  selector: 'app-create-order',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Registrar Nuevo Pedido</h1>
          <p>Creacion de ordenes con envio hacia microservicio Spring Boot / API Gateway</p>
        </div>
        <div>
          <a routerLink="/pedidos" class="btn btn-secondary">
            Volver a Pedidos
          </a>
        </div>
      </div>

      <div class="form-layout">
        <!-- Formulario principal -->
        <form (ngSubmit)="onSubmit()" #orderForm="ngForm" class="order-form">
          <!-- Seccion 1: Datos del Cliente -->
          <div class="card form-card">
            <div class="card-header">
              <h2 class="card-title">1. Informacion del Cliente</h2>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Razon Social o Nombre Completo *</label>
                <input
                  type="text"
                  class="form-control"
                  name="clienteNombre"
                  [(ngModel)]="clienteNombre"
                  required
                  placeholder="Ej: Inversiones Tecnologicas del Norte SpA"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Correo Electronico *</label>
                <input
                  type="email"
                  class="form-control"
                  name="clienteEmail"
                  [(ngModel)]="clienteEmail"
                  required
                  placeholder="compras@empresa.cl"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Telefono de Contacto *</label>
                <input
                  type="text"
                  class="form-control"
                  name="clienteTelefono"
                  [(ngModel)]="clienteTelefono"
                  required
                  placeholder="+56 9 1234 5678"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Ciudad de Despacho *</label>
                <input
                  type="text"
                  class="form-control"
                  name="ciudad"
                  [(ngModel)]="ciudad"
                  required
                  placeholder="Ej: Santiago, Valparaiso, Concepcion"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Direccion de Entrega Completa *</label>
              <input
                type="text"
                class="form-control"
                name="direccionEnvio"
                [(ngModel)]="direccionEnvio"
                required
                placeholder="Calle, numero, oficina o bodega"
              />
            </div>
          </div>

          <!-- Seccion 2: Configuracion de Orden -->
          <div class="card form-card">
            <div class="card-header">
              <h2 class="card-title">2. Parametros del Envio</h2>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Nivel de Prioridad</label>
                <select class="form-control" name="prioridad" [(ngModel)]="prioridad">
                  <option value="BAJA">Baja</option>
                  <option value="MEDIA">Media</option>
                  <option value="ALTA">Alta</option>
                  <option value="CRITICA">Critica</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Canal de Venta</label>
                <select class="form-control" name="canalVenta" [(ngModel)]="canalVenta">
                  <option value="PORTAL_CLIENTES">Portal de Clientes</option>
                  <option value="WEB">Tienda Web</option>
                  <option value="VENTA_TELEFONICA">Venta Telefonica / B2B</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Observaciones de Entrega</label>
              <textarea
                class="form-control"
                rows="2"
                name="observaciones"
                [(ngModel)]="observaciones"
                placeholder="Instrucciones especificas para transportista o recepcion..."
              ></textarea>
            </div>
          </div>

          <!-- Seccion 3: Articulos del Pedido -->
          <div class="card form-card">
            <div class="card-header">
              <div>
                <h2 class="card-title">3. Articulos y Productos</h2>
                <p>Agrega los articulos a incluir en este pedido</p>
              </div>
              <button type="button" (click)="addItem()" class="btn btn-secondary btn-sm">
                <svg class="icon-svg" viewBox="0 0 24 24">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>Agregar Articulo</span>
              </button>
            </div>

            <div class="items-list">
              <div class="item-row" *ngFor="let item of items; let i = index">
                <div class="item-field prod">
                  <label class="form-label">Producto</label>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="Descripcion del producto"
                    [(ngModel)]="item.producto"
                    [name]="'prod_' + i"
                    required
                  />
                </div>

                <div class="item-field sku">
                  <label class="form-label">SKU</label>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="SKU"
                    [(ngModel)]="item.sku"
                    [name]="'sku_' + i"
                    required
                  />
                </div>

                <div class="item-field qty">
                  <label class="form-label">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    class="form-control"
                    [(ngModel)]="item.cantidad"
                    (input)="recalcSubtotal(item)"
                    [name]="'qty_' + i"
                    required
                  />
                </div>

                <div class="item-field price">
                  <label class="form-label">Precio Unitario ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    class="form-control"
                    [(ngModel)]="item.precioUnitario"
                    (input)="recalcSubtotal(item)"
                    [name]="'price_' + i"
                    required
                  />
                </div>

                <div class="item-field subtotal">
                  <label class="form-label">Subtotal</label>
                  <span class="subtotal-val">{{ item.subtotal | currency:'CLP':'symbol-narrow':'1.0-0' }}</span>
                </div>

                <div class="item-field remove">
                  <button
                    type="button"
                    (click)="removeItem(i)"
                    [disabled]="items.length === 1"
                    class="btn btn-outline btn-sm delete-btn"
                    title="Eliminar producto"
                  >
                    <svg class="icon-svg" viewBox="0 0 24 24">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Acciones del Formulario -->
          <div class="form-actions">
            <button
              type="submit"
              [disabled]="!orderForm.form.valid || isSubmitting"
              class="btn btn-primary btn-submit"
            >
              <svg class="icon-svg" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>{{ isSubmitting ? 'Registrando en Cloud...' : 'Guardar y Emitir Pedido' }}</span>
            </button>
          </div>
        </form>

        <!-- Panel Lateral de Resumen Financiero -->
        <div class="summary-sidebar">
          <div class="card summary-card">
            <h3 class="summary-title">Resumen de Liquidacion</h3>
            <div class="summary-lines">
              <div class="sum-row">
                <span>Subtotal Neto:</span>
                <span>{{ calculateNeto() | currency:'CLP':'symbol-narrow':'1.0-0' }}</span>
              </div>
              <div class="sum-row">
                <span>IVA (19%):</span>
                <span>{{ calculateIva() | currency:'CLP':'symbol-narrow':'1.0-0' }}</span>
              </div>
              <div class="sum-row total">
                <strong>Total General:</strong>
                <strong class="total-amount">{{ calculateTotal() | currency:'CLP':'symbol-narrow':'1.0-0' }}</strong>
              </div>
            </div>

            <div class="summary-info-box">
              <div class="info-title">Envio a Nivel Cloud</div>
              <p>
                Al confirmar, la peticion HTTP sera emitida mediante el servicio de pedidos hacia el
                <strong>AWS API Gateway</strong> incluyendo el encabezado
                <code>Authorization: Bearer [TOKEN]</code> gestionado por <strong>MsalInterceptor</strong>.
              </p>
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

    .form-layout {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 24px;
      align-items: start;
    }

    @media (max-width: 960px) {
      .form-layout {
        grid-template-columns: 1fr;
      }
    }

    .order-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-card {
      padding: 24px;
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .item-row {
      display: grid;
      grid-template-columns: 3fr 1.5fr 1fr 1.5fr 1.5fr 40px;
      gap: 12px;
      align-items: end;
      background-color: rgba(0, 0, 0, 0.2);
      padding: 12px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
    }

    @media (max-width: 768px) {
      .item-row {
        grid-template-columns: 1fr;
      }
    }

    .subtotal-val {
      display: block;
      padding: 10px 0;
      font-weight: 700;
      color: #60a5fa;
      font-family: var(--font-mono);
      font-size: 0.85rem;
    }

    .delete-btn {
      padding: 8px;
      margin-bottom: 2px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
    }

    .btn-submit {
      padding: 14px 28px;
      font-size: 1rem;
    }

    .summary-card {
      padding: 24px;
      position: sticky;
      top: 24px;
    }

    .summary-title {
      margin-bottom: 16px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--border-subtle);
    }

    .summary-lines {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 20px;
    }

    .sum-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
      color: var(--text-secondary);
    }

    .sum-row.total {
      padding-top: 12px;
      border-top: 1px solid var(--border-subtle);
      font-size: 1.1rem;
      color: var(--text-primary);
    }

    .total-amount {
      color: #3b82f6;
    }

    .summary-info-box {
      background-color: rgba(37, 99, 235, 0.08);
      border: 1px solid rgba(59, 130, 246, 0.2);
      padding: 14px;
      border-radius: var(--radius-md);
      font-size: 0.8rem;
    }

    .info-title {
      font-weight: 600;
      color: #60a5fa;
      margin-bottom: 6px;
    }

    .summary-info-box p {
      margin: 0;
      line-height: 1.4;
      font-size: 0.78rem;
    }
  `]
})
export class CreateOrderComponent {
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);

  public clienteNombre = '';
  public clienteEmail = '';
  public clienteTelefono = '';
  public ciudad = '';
  public direccionEnvio = '';
  public prioridad: PrioridadPedido = 'MEDIA';
  public canalVenta: 'PORTAL_CLIENTES' | 'WEB' | 'VENTA_TELEFONICA' = 'PORTAL_CLIENTES';
  public observaciones = '';

  public isSubmitting = false;

  public items: ItemPedido[] = [
    {
      id: 'it-temp-1',
      producto: 'Servidor Dell PowerEdge R650xs',
      sku: 'SRV-DELL-R65',
      cantidad: 1,
      precioUnitario: 2400000,
      subtotal: 2400000,
    },
  ];

  public addItem(): void {
    const nextIdx = this.items.length + 1;
    this.items.push({
      id: `it-temp-${nextIdx}`,
      producto: '',
      sku: `PROD-${String(nextIdx).padStart(3, '0')}`,
      cantidad: 1,
      precioUnitario: 0,
      subtotal: 0,
    });
  }

  public removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.splice(index, 1);
    }
  }

  public recalcSubtotal(item: ItemPedido): void {
    item.subtotal = (item.cantidad || 0) * (item.precioUnitario || 0);
  }

  public calculateTotal(): number {
    return this.items.reduce((acc, curr) => acc + (curr.subtotal || 0), 0);
  }

  public calculateNeto(): number {
    return Math.round(this.calculateTotal() / 1.19);
  }

  public calculateIva(): number {
    return this.calculateTotal() - this.calculateNeto();
  }

  public onSubmit(): void {
    if (this.items.length === 0 || this.calculateTotal() <= 0) {
      alert('Debes agregar al menos un producto valido con precio.');
      return;
    }

    this.isSubmitting = true;

    this.orderService.createPedido({
      clienteNombre: this.clienteNombre,
      clienteEmail: this.clienteEmail,
      clienteTelefono: this.clienteTelefono,
      ciudad: this.ciudad,
      direccionEnvio: this.direccionEnvio,
      prioridad: this.prioridad,
      canalVenta: this.canalVenta,
      observaciones: this.observaciones,
      estado: 'PENDIENTE',
      items: this.items,
      total: this.calculateTotal(),
    }).subscribe({
      next: (created) => {
        this.isSubmitting = false;
        alert(`Pedido ${created.numeroPedido} registrado correctamente.`);
        this.router.navigate(['/pedidos']);
      },
      error: () => {
        this.isSubmitting = false;
        alert('Error al registrar pedido.');
      }
    });
  }
}
