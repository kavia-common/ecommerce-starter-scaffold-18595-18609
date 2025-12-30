import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { formatMoneyFromCents } from '../../core/money';
import { CartStoreService } from '../../services/cart-store.service';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart-page.component.html',
  styleUrl: './cart-page.component.css',
})
export class CartPageComponent {
  readonly cart = computed(() => this.cartStore.cart());
  readonly state = computed(() => this.cartStore.state());
  readonly error = computed(() => this.cartStore.error());

  readonly subtotal = computed(() =>
    formatMoneyFromCents(this.cartStore.subtotalCents(), this.cartStore.currencyCode()),
  );

  constructor(private readonly cartStore: CartStoreService) {
    this.cartStore.ensureCartLoaded().subscribe({
      error: (e: unknown) =>
        this.cartStore.setError((e as { message?: string } | null | undefined)?.message ?? 'Failed to load cart'),
    });
  }

  inc(productId: number, current: number) {
    this.cartStore.updateQuantity(productId, current + 1).subscribe({
      error: (e: unknown) =>
        this.cartStore.setError((e as { message?: string } | null | undefined)?.message ?? 'Failed to update quantity'),
    });
  }

  dec(productId: number, current: number) {
    this.cartStore.updateQuantity(productId, Math.max(1, current - 1)).subscribe({
      error: (e: unknown) =>
        this.cartStore.setError((e as { message?: string } | null | undefined)?.message ?? 'Failed to update quantity'),
    });
  }

  remove(productId: number) {
    this.cartStore.removeItem(productId).subscribe({
      error: (e: unknown) =>
        this.cartStore.setError((e as { message?: string } | null | undefined)?.message ?? 'Failed to remove item'),
    });
  }

  clear() {
    this.cartStore.clear().subscribe({
      error: (e: unknown) =>
        this.cartStore.setError((e as { message?: string } | null | undefined)?.message ?? 'Failed to clear cart'),
    });
  }

  lineTotal(unitCents: number, qty: number, currency: string) {
    return formatMoneyFromCents(unitCents * qty, currency);
  }
}
