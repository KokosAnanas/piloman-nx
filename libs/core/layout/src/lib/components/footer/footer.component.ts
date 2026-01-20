import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Футер приложения.
 */
@Component({
  selector: 'piloman-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="layout-footer">
      <span class="footer-text">
        &copy; {{ currentYear }} piloman.ru — Система для специалистов НК
      </span>
    </div>
  `,
  styles: `
    .layout-footer {
      padding: 1.5rem 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-top: 1px solid var(--p-content-border-color);
      margin-top: auto;
    }

    .footer-text {
      font-size: 0.875rem;
      color: var(--p-text-muted-color);
    }

    @media (max-width: 991px) {
      .layout-footer {
        padding: 1rem;
      }
    }
  `,
})
export class FooterComponent {
  readonly currentYear = new Date().getFullYear();
}