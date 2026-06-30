import { Component, afterNextRender, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { HealthResponse } from '@base/api-contract';

@Component({
  selector: 'app-health',
  templateUrl: './health.html',
  styleUrl: './health.css',
})
export class Health {
  private readonly http = inject(HttpClient);

  protected readonly status = signal<'loading' | 'ok' | 'error'>('loading');
  protected readonly data = signal<HealthResponse | null>(null);

  constructor() {
    afterNextRender(() => {
      this.checkHealth();
    });
  }

  private checkHealth(): void {
    this.http
      .get<HealthResponse>('/api/health?appMeta=true&uptime=true')
      .subscribe({
        next: (res) => {
          this.status.set('ok');
          this.data.set(res);
        },
        error: () => {
          this.status.set('error');
        },
      });
  }
}
