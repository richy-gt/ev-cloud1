import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="navbar">
      <div class="navbar-brand">
        <div class="brand-logo">
          <svg class="icon-svg brand-icon" viewBox="0 0 24 24">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
          <span class="brand-name">PEDIDOS<strong>360</strong></span>
        </div>
        <span class="brand-tag">Cloud Native</span>
      </div>

      <div class="navbar-actions">
        <!-- Indicador de estado de autenticacion -->
        <div class="auth-status-indicator" [class.is-azure]="authService.isAzureADConfigured()">
          <span class="status-dot"></span>
          <span class="status-text">
            {{ authService.isAzureADConfigured() ? 'Azure AD Conectado' : 'Modo Simulacion' }}
          </span>
        </div>

        <!-- Perfil de usuario -->
        <ng-container *ngIf="authService.userProfile$ | async as user">
          <div class="user-chip">
            <div class="user-avatar">
              {{ getUserInitials(user.name) }}
            </div>
            <div class="user-info">
              <span class="user-name">{{ user.name }}</span>
              <span class="user-role">{{ user.roles[0] || 'Operador' }}</span>
            </div>
          </div>

          <button (click)="onLogout()" class="btn btn-outline btn-sm logout-btn" title="Cerrar sesion">
            <svg class="icon-svg" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Salir</span>
          </button>
        </ng-container>

        <ng-container *ngIf="!(authService.isAuthenticated$ | async)">
          <a routerLink="/login" class="btn btn-primary btn-sm">
            Iniciar Sesion
          </a>
        </ng-container>
      </div>
    </header>
  `,
  styles: [`
    .navbar {
      height: 64px;
      background-color: var(--bg-surface);
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 28px;
      z-index: 20;
    }

    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .brand-icon {
      color: var(--color-primary);
      width: 24px;
      height: 24px;
    }

    .brand-name {
      font-size: 1.15rem;
      letter-spacing: 0.05em;
      color: #ffffff;
    }

    .brand-name strong {
      color: #3b82f6;
    }

    .brand-tag {
      font-size: 0.7rem;
      background-color: rgba(59, 130, 246, 0.15);
      color: #60a5fa;
      padding: 2px 8px;
      border-radius: var(--radius-full);
      font-weight: 600;
      border: 1px solid rgba(59, 130, 246, 0.3);
    }

    .navbar-actions {
      display: flex;
      align-items: center;
      gap: 18px;
    }

    .auth-status-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 5px 12px;
      border-radius: var(--radius-full);
      background-color: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.25);
      font-size: 0.75rem;
      font-weight: 500;
      color: #fbbf24;
    }

    .auth-status-indicator.is-azure {
      background-color: rgba(16, 185, 129, 0.1);
      border-color: rgba(16, 185, 129, 0.25);
      color: #34d399;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: currentColor;
    }

    .user-chip {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .user-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: linear-gradient(135deg, #2563eb, #7c3aed);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 700;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }

    .user-name {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .user-role {
      font-size: 0.7rem;
      color: var(--text-muted);
    }

    .logout-btn {
      padding: 6px 12px;
    }
  `]
})
export class NavbarComponent {
  public readonly authService = inject(AuthService);

  public getUserInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  public onLogout(): void {
    this.authService.logout();
  }
}
