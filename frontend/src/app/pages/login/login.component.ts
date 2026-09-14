import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="login-wrapper">
      <div class="login-card card">
        <div class="brand-header">
          <div class="brand-badge">
            <svg class="icon-svg" viewBox="0 0 24 24">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            <span>Cloud Native 2025</span>
          </div>
          <h1 class="system-title">PEDIDOS<strong>360</strong></h1>
          <p class="system-subtitle">Arquitectura Segura con Angular, MSAL y Spring Boot</p>
        </div>

        <div class="azure-status-box" [class.is-ready]="authService.isAzureADConfigured()">
          <div class="status-header">
            <div class="status-dot"></div>
            <strong>Estado de Integracion con Azure AD</strong>
          </div>
          <div class="status-details">
            <div class="detail-row">
              <span class="label">Client ID:</span>
              <code class="val">{{ environment.azure.clientId }}</code>
            </div>
            <div class="detail-row">
              <span class="label">Tenant ID:</span>
              <code class="val">{{ environment.azure.tenantId }}</code>
            </div>
            <div class="detail-row">
              <span class="label">Redirect URI:</span>
              <code class="val">{{ environment.azure.redirectUri }}</code>
            </div>
          </div>
        </div>

        <div class="actions-group">
          <!-- Boton principal: Iniciar Sesion con Microsoft Azure AD -->
          <button (click)="onAzureLogin()" [disabled]="isLoading" class="btn btn-azure">
            <svg class="icon-svg ms-icon" viewBox="0 0 24 24">
              <rect x="2" y="2" width="9" height="9" fill="#f25022"></rect>
              <rect x="13" y="2" width="9" height="9" fill="#7fba00"></rect>
              <rect x="2" y="13" width="9" height="9" fill="#00a4ef"></rect>
              <rect x="13" y="13" width="9" height="9" fill="#ffb900"></rect>
            </svg>
            <span>Iniciar Sesion con Microsoft Azure AD</span>
          </button>

          <!-- Boton secundario: Modo Demostracion -->
          <button (click)="onDemoLogin()" class="btn btn-secondary btn-demo">
            <svg class="icon-svg" viewBox="0 0 24 24">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            <span>Ingresar en Modo Demostracion Local</span>
          </button>
        </div>

        <div class="info-note">
          <p>
            <strong>Nota para el equipo y evaluacion:</strong>
            Para conectar con el Azure AD real, ingresa el Client ID y Tenant ID en
            <code>src/environments/environment.ts</code> siguiendo los pasos indicados en
            <strong>GUIA_CONFIGURACION_AZURE.md</strong>.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at top, #1e293b 0%, #090d16 100%);
      padding: 20px;
    }

    .login-card {
      max-width: 520px;
      width: 100%;
      background-color: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 36px 32px;
      box-shadow: var(--shadow-lg);
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .brand-header {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .brand-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #60a5fa;
      background-color: rgba(37, 99, 235, 0.12);
      border: 1px solid rgba(59, 130, 246, 0.25);
      padding: 4px 12px;
      border-radius: var(--radius-full);
      margin-bottom: 6px;
    }

    .system-title {
      font-size: 2rem;
      letter-spacing: -0.02em;
      color: #ffffff;
      margin: 0;
    }

    .system-title strong {
      color: #3b82f6;
    }

    .system-subtitle {
      font-size: 0.9rem;
      color: var(--text-secondary);
      margin: 0;
    }

    .azure-status-box {
      background-color: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: var(--radius-md);
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .azure-status-box.is-ready {
      border-color: rgba(16, 185, 129, 0.3);
    }

    .status-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      color: #f3f4f6;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #f59e0b;
    }

    .azure-status-box.is-ready .status-dot {
      background-color: #10b981;
    }

    .status-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 0.78rem;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      gap: 10px;
    }

    .label {
      color: var(--text-muted);
    }

    .val {
      color: #cbd5e1;
      font-family: var(--font-mono);
      font-size: 0.75rem;
      max-width: 280px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .actions-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .btn-azure {
      background-color: #0078d4;
      color: #ffffff;
      padding: 12px 20px;
      font-size: 0.95rem;
      border-radius: var(--radius-md);
    }

    .btn-azure:hover {
      background-color: #106ebe;
    }

    .ms-icon {
      width: 20px;
      height: 20px;
    }

    .btn-demo {
      padding: 10px 18px;
      font-size: 0.875rem;
    }

    .info-note {
      background-color: rgba(255, 255, 255, 0.02);
      border-left: 3px solid #3b82f6;
      padding: 12px 14px;
      border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
      font-size: 0.8rem;
      color: var(--text-secondary);
      line-height: 1.4;
    }

    .info-note code {
      color: #93c5fd;
      font-family: var(--font-mono);
    }
  `]
})
export class LoginComponent {
  public readonly authService = inject(AuthService);
  public readonly router = inject(Router);
  public readonly environment = environment;
  public isLoading = false;

  public async onAzureLogin(): Promise<void> {
    this.isLoading = true;
    try {
      await this.authService.loginWithPopup();
    } catch (err) {
      console.warn('Azure AD no pudo completar el login (puede requerir registrar la app en Azure Portal):', err);
      alert('Azure AD requiere que tu companero configure el Client ID y Redirect URI en Azure Portal. Mientras tanto, puedes usar el Modo Demostracion Local.');
    } finally {
      this.isLoading = false;
    }
  }

  public onDemoLogin(): void {
    this.authService.setDemoUser();
    this.router.navigate(['/dashboard']);
  }
}
