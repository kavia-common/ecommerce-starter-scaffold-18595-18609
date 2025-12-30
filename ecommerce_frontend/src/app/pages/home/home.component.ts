import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { formatMoneyFromCents } from '../../core/money';
import type { Product } from '../../models/api.models';
import { ApiClientService } from '../../services/api-client.service';
import { CartStoreService } from '../../services/cart-store.service';

type LoadState = 'loading' | 'loaded' | 'error';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  private readonly productsSignal = signal<Product[]>([]);
  private readonly stateSignal = signal<LoadState>('loading');
  private readonly errorSignal = signal<string | null>(null);

  readonly products = computed(() => this.productsSignal());
  readonly state = computed(() => this.stateSignal());
  readonly error = computed(() => this.errorSignal());

  constructor(private readonly api: ApiClientService, private readonly cart: CartStoreService) {
    this.load();
    this.cart.ensureCartLoaded().subscribe({ error: () => {} });
  }

  load() {
    this.stateSignal.set('loading');
    this.errorSignal.set(null);

    this.api.listProducts().subscribe({
      next: (p) => {
        this.productsSignal.set(p ?? []);
        this.stateSignal.set('loaded');
      },
      error: (e) => {
        this.errorSignal.set(e?.message ?? 'Failed to load products');
        this.stateSignal.set('error');
      },
    });
  }

  price(p: Product) {
    return formatMoneyFromCents(p.price_cents, p.currency_code);
  }

  add(p: Product) {
    this.cart.addToCart(p, 1).subscribe({
      error: (e) => this.cart.setError(e?.message ?? 'Failed to add to cart'),
    });
  }
}
