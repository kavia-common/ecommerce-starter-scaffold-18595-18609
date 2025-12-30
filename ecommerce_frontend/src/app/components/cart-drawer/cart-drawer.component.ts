import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { formatMoneyFromCents } from '../../core/money';
import { CartStoreService } from '../../services/cart-store.service';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart-drawer.component.html',
  styleUrl: './cart-drawer.component.css',
})
export class CartDrawerComponent {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();

  readonly cart = computed(() => this.cartStore.cart());
  readonly state = computed(() => this.cartStore.state());
  readonly error = computed(() => this.cartStore.error());

  readonly subtotal = computed(() =>
    formatMoneyFromCents(this.cartStore.subtotalCents(), this.cartStore.currencyCode()),
  );

  constructor(private readonly cartStore: CartStoreService) {}

  formatLine(unitCents: number, qty: number, currency: string) {
    return formatMoneyFromCents(unitCents * qty, currency);
  }

  onBackdropClick(evt: globalThis.MouseEvent) {
    if ((evt.target as HTMLElement | null)?.classList?.contains('backdrop')) this.close.emit();
  }

  inc(productId: number, current: number) {
    this.cartStore.updateQuantity(productId, current + 1).subscribe({
      error: (e: unknown) =>
        this.cartStore.setError((e as { message?: string } | null | undefined)?.message ?? 'Failed to update quantity'),
    });
  }

  dec(productId: number, current: number) {
    const next = Math.max(1, current - 1);
    this.cartStore.updateQuantity(productId, next).subscribe({
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
}
