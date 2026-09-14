import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { TokenInspectionData } from '../../core/models/auth.model';

@Component({
  selector: 'app-token-inspector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Inspector de Tokens y Claims</h1>
          <p>Validacion de estructura JWT, roles, scopes y claims conforme a la pauta de evaluacion DSY1107</p>
        </div>
        <div class="header-actions">
          <button (click)="refreshToken()" class="btn btn-primary btn-sm">
            <svg class="icon-svg" viewBox="0 0 24 24">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            <span>Renovar Token MSAL</span>
          </button>
        </div>
      </div>

      <!-- Resumen de Claims Criticos -->
      <div class="claims-summary-grid">
        <div class="card summary-box">
          <span class="box-label">Estado de Vigencia</span>
          <div class="status-indicator-box" [class.valid]="tokenData.isValid" [class.expired]="tokenData.isExpired">
            <span class="dot"></span>
            <strong>{{ tokenData.isValid ? 'Token Valido' : 'Token Expirado' }}</strong>
          </div>
          <span class="sub-text">
            {{ tokenData.expiresInSeconds > 0 ? 'Expira en ' + tokenData.expiresInSeconds + ' segundos' : 'Expirado' }}
          </span>
        </div>

        <div class="card summary-box">
          <span class="box-label">Roles Asignados (claim "roles")</span>
          <div class="badges-wrap">
            <span class="badge badge-alta" *ngFor="let r of tokenData.roles">
              {{ r }}
            </span>
            <span class="text-muted-sm" *ngIf="tokenData.roles.length === 0">
              Sin roles especificos
            </span>
          </div>
          <span class="sub-text">Utilizado para autorizacion en el BFF / EC2</span>
        </div>

        <div class="card summary-box">
          <span class="box-label">Scopes Autorizados (claim "scp")</span>
          <div class="badges-wrap">
            <span class="badge badge-despachado" *ngFor="let s of tokenData.scopes">
              {{ s }}
            </span>
            <span class="text-muted-sm" *ngIf="tokenData.scopes.length === 0">
              Sin scopes delegados
            </span>
          </div>
          <span class="sub-text">Permisos delegados para el API Gateway</span>
        </div>

        <div class="card summary-box">
          <span class="box-label">Audiencia (claim "aud")</span>
          <code class="aud-code">{{ tokenData.audience }}</code>
          <span class="sub-text">Identificador del backend o API esperada</span>
        </div>
      </div>

      <!-- Desglose de Tres Segmentos del JWT -->
      <div class="card jwt-viewer-card">
        <div class="card-header">
          <h2 class="card-title">Desglose Tecnico del JSON Web Token (RFC 7519)</h2>
          <button (click)="copyRawToken()" class="btn btn-outline btn-sm">
            <svg class="icon-svg" viewBox="0 0 24 24">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span>{{ copySuccess ? 'Copiado al Portapapeles' : 'Copiar Token Crudo' }}</span>
          </button>
        </div>

        <div class="jwt-segments-grid">
          <!-- Segmento 1: Header -->
          <div class="segment-column">
            <div class="segment-title header-title">
              <span class="tag">HEADER</span>
              <span>Algoritmo y Tipo</span>
            </div>
            <pre class="code-block json-block header-bg">{{ tokenData.header | json }}</pre>
          </div>

          <!-- Segmento 2: Payload -->
          <div class="segment-column">
            <div class="segment-title payload-title">
              <span class="tag">PAYLOAD</span>
              <span>Claims y Datos de Identidad</span>
            </div>
            <pre class="code-block json-block payload-bg">{{ tokenData.payload | json }}</pre>
          </div>

          <!-- Segmento 3: Signature -->
          <div class="segment-column">
            <div class="segment-title signature-title">
              <span class="tag">SIGNATURE</span>
              <span>Firma Criptografica (RS256)</span>
            </div>
            <div class="code-block signature-bg">
              <code>{{ tokenData.signature }}</code>
              <p class="sig-note">
                Firmado con clave privada en Azure Active Directory.
                El API Gateway y el BFF verifican esta firma contra las claves publicas JWKS del emisor (iss).
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Token Crudo y Validacion en BFF -->
      <div class="card raw-token-card">
        <h3 class="card-title">Cadena Completa del Bearer Token</h3>
        <p class="token-helper-text">
          Este es el token compacto codificado en Base64Url que MsalInterceptor adjunta automaticamente
          en la cabecera <code>Authorization: Bearer ...</code> hacia el API Gateway.
        </p>
        <div class="raw-token-box">
          <code>{{ tokenData.rawToken }}</code>
        </div>
      </div>

      <!-- Guia de Validacion para el Backend / BFF -->
      <div class="card bff-guide-card">
        <div class="card-header">
          <h2 class="card-title">Criterios de Validacion en el Backend (Spring Boot en AWS EC2)</h2>
          <span class="badge badge-entregado">Pauta de Evaluacion: BFF (40%)</span>
        </div>
        <div class="bff-points-grid">
          <div class="point-item">
            <strong>1. Validacion de Emisor (iss)</strong>
            <p>Debe coincidir con <code>{{ tokenData.issuer }}</code> emitido por Azure AD.</p>
          </div>
          <div class="point-item">
            <strong>2. Validacion de Audiencia (aud)</strong>
            <p>Debe coincidir exactamente con el App ID URI del backend en Azure AD.</p>
          </div>
          <div class="point-item">
            <strong>3. Verificacion de Firma (JWKS)</strong>
            <p>Spring Security valida la firma consultando <code>/discovery/v2.0/keys</code> en Azure.</p>
          </div>
          <div class="point-item">
            <strong>4. Control de Expiracion (exp)</strong>
            <p>Peticiones recibidas con fecha posterior a <code>exp</code> seran rechazadas con HTTP 401 Unauthorized.</p>
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

    .claims-summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
      margin-bottom: 28px;
    }

    .summary-box {
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .box-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .status-indicator-box {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      border-radius: var(--radius-sm);
      font-size: 0.9rem;
    }

    .status-indicator-box.valid {
      background-color: var(--color-success-bg);
      color: var(--color-success);
    }

    .status-indicator-box.expired {
      background-color: var(--color-danger-bg);
      color: var(--color-danger);
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: currentColor;
    }

    .badges-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .aud-code {
      font-family: var(--font-mono);
      font-size: 0.8rem;
      color: #93c5fd;
      word-break: break-all;
    }

    .sub-text {
      font-size: 0.72rem;
      color: var(--text-muted);
    }

    .jwt-viewer-card {
      margin-bottom: 28px;
      padding: 24px;
    }

    .jwt-segments-grid {
      display: grid;
      grid-template-columns: 1fr 1.5fr 1fr;
      gap: 16px;
    }

    @media (max-width: 1024px) {
      .jwt-segments-grid {
        grid-template-columns: 1fr;
      }
    }

    .segment-column {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .segment-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .segment-title .tag {
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.68rem;
      font-family: var(--font-mono);
    }

    .header-title { color: #f87171; }
    .header-title .tag { background-color: rgba(239, 68, 68, 0.2); }

    .payload-title { color: #c084fc; }
    .payload-title .tag { background-color: rgba(192, 132, 252, 0.2); }

    .signature-title { color: #38bdf8; }
    .signature-title .tag { background-color: rgba(56, 189, 248, 0.2); }

    .json-block {
      max-height: 380px;
      overflow-y: auto;
      font-size: 0.8rem;
    }

    .signature-bg {
      word-break: break-all;
      font-size: 0.8rem;
      max-height: 380px;
      overflow-y: auto;
    }

    .sig-note {
      margin-top: 14px;
      font-size: 0.72rem;
      color: var(--text-muted);
      line-height: 1.4;
      font-family: var(--font-sans);
    }

    .raw-token-card {
      margin-bottom: 28px;
      padding: 24px;
    }

    .token-helper-text {
      font-size: 0.82rem;
      margin-bottom: 12px;
    }

    .raw-token-box {
      background-color: #090d16;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 14px;
      word-break: break-all;
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: #94a3b8;
      max-height: 120px;
      overflow-y: auto;
    }

    .bff-guide-card {
      padding: 24px;
      background-color: rgba(255, 255, 255, 0.02);
    }

    .bff-points-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }

    .point-item {
      background-color: rgba(0, 0, 0, 0.25);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 14px;
    }

    .point-item strong {
      display: block;
      font-size: 0.85rem;
      color: #f3f4f6;
      margin-bottom: 4px;
    }

    .point-item p {
      margin: 0;
      font-size: 0.78rem;
      line-height: 1.4;
    }

    .point-item code {
      color: #60a5fa;
      font-family: var(--font-mono);
      font-size: 0.72rem;
    }
  `]
})
export class TokenInspectorComponent implements OnInit {
  private readonly authService = inject(AuthService);

  public tokenData!: TokenInspectionData;
  public copySuccess = false;

  ngOnInit(): void {
    this.tokenData = this.authService.inspectToken();
  }

  public async refreshToken(): Promise<void> {
    try {
      const newToken = await this.authService.getAccessToken();
      this.tokenData = this.authService.inspectToken(newToken);
    } catch {
      this.tokenData = this.authService.inspectToken();
    }
  }

  public copyRawToken(): void {
    if (this.tokenData?.rawToken) {
      navigator.clipboard.writeText(this.tokenData.rawToken).then(() => {
        this.copySuccess = true;
        setTimeout(() => (this.copySuccess = false), 2500);
      });
    }
  }
}
