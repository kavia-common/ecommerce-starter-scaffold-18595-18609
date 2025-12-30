import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { formatMoneyFromCents } from '../../core/money';
import type { Product } from '../../models/api.models';
import { ApiClientService } from '../../services/api-client.service';
import { CartStoreService } from '../../services/cart-store.service';

type LoadState = 'loading' | 'loaded' | 'error';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css',
})
export class ProductDetailsComponent {
  private readonly stateSignal = signal<LoadState>('loading');
  private readonly errorSignal = signal<string | null>(null);
  private readonly productSignal = signal<Product | null>(null);

  readonly state = computed(() => this.stateSignal());
  readonly error = computed(() => this.errorSignal());
  readonly product = computed(() => this.productSignal());

  constructor(
    private readonly route: ActivatedRoute,
    private readonly api: ApiClientService,
    private readonly cart: CartStoreService,
  ) {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.load(id);
    this.cart.ensureCartLoaded().subscribe({ error: () => {} });
  }

  load(productId: number) {
    this.stateSignal.set('loading');
    this.errorSignal.set(null);
    this.productSignal.set(null);

    this.api.getProduct(productId).subscribe({
      next: (p) => {
        this.productSignal.set(p);
        this.stateSignal.set('loaded');
      },
      error: (e) => {
        this.errorSignal.set(e?.message ?? 'Failed to load product');
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
