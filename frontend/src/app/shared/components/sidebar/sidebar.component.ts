import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar">
      <div class="sidebar-section">
        <span class="section-title">GESTION</span>
        <nav class="nav-list">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <svg class="icon-svg" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>Dashboard</span>
          </a>

          <a routerLink="/pedidos" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="nav-item">
            <svg class="icon-svg" viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span>Pedidos</span>
          </a>

          <a routerLink="/pedidos/nuevo" routerLinkActive="active" class="nav-item">
            <svg class="icon-svg" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            <span>Nuevo Pedido</span>
          </a>
        </nav>
      </div>

      <div class="sidebar-section">
        <span class="section-title">CLOUD & SEGURIDAD</span>
        <nav class="nav-list">
          <a routerLink="/tokens" routerLinkActive="active" class="nav-item">
            <svg class="icon-svg" viewBox="0 0 24 24">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span>Inspector de Tokens</span>
          </a>

          <a routerLink="/api-tester" routerLinkActive="active" class="nav-item">
            <svg class="icon-svg" viewBox="0 0 24 24">
              <polyline points="4 17 10 11 4 5"></polyline>
              <line x1="12" y1="19" x2="20" y2="19"></line>
            </svg>
            <span>Consola API Gateway</span>
          </a>
        </nav>
      </div>

      <div class="sidebar-footer">
        <div class="course-badge">
          <div class="badge-dot"></div>
          <div class="badge-text">
            <strong>DSY1107</strong>
            <span>Cloud Native I</span>
          </div>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 250px;
      background-color: var(--bg-surface);
      border-right: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      padding: 24px 16px;
      gap: 28px;
    }

    .sidebar-section {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .section-title {
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      padding: 0 12px;
    }

    .nav-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .nav-item:hover {
      background-color: rgba(255, 255, 255, 0.04);
      color: var(--text-primary);
    }

    .nav-item.active {
      background-color: rgba(37, 99, 235, 0.15);
      color: #60a5fa;
      font-weight: 600;
    }

    .nav-item.active svg {
      color: #3b82f6;
    }

    .sidebar-footer {
      margin-top: auto;
      padding-top: 20px;
      border-top: 1px solid var(--border-subtle);
    }

    .course-badge {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      background-color: rgba(0, 0, 0, 0.2);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
    }

    .badge-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--color-primary);
    }

    .badge-text {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }

    .badge-text strong {
      font-size: 0.8rem;
      color: var(--text-primary);
    }

    .badge-text span {
      font-size: 0.7rem;
      color: var(--text-muted);
    }
  `]
})
export class SidebarComponent {}
