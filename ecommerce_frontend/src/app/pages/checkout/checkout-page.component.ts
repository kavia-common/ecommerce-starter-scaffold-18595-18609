import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { formatMoneyFromCents } from '../../core/money';
import type { Order } from '../../models/api.models';
import { ApiClientService } from '../../services/api-client.service';
import { CartStoreService } from '../../services/cart-store.service';

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout-page.component.html',
  styleUrl: './checkout-page.component.css',
})
export class CheckoutPageComponent {
  // Mock form fields
  name = '';
  email = '';
  address1 = '';
  city = '';
  postal = '';
  cardNumber = '';
  expiry = '';
  cvc = '';

  private readonly stateSignal = signal<SubmitState>('idle');
  private readonly errorSignal = signal<string | null>(null);
  private readonly orderSignal = signal<Order | null>(null);

  readonly cart = computed(() => this.cartStore.cart());
  readonly cartState = computed(() => this.cartStore.state());
  readonly cartError = computed(() => this.cartStore.error());

  readonly state = computed(() => this.stateSignal());
  readonly error = computed(() => this.errorSignal());
  readonly order = computed(() => this.orderSignal());

  readonly subtotal = computed(() =>
    formatMoneyFromCents(this.cartStore.subtotalCents(), this.cartStore.currencyCode()),
  );

  constructor(
    private readonly api: ApiClientService,
    private readonly cartStore: CartStoreService,
    private readonly router: Router,
  ) {
    this.cartStore.ensureCartLoaded().subscribe({
      error: (e) => this.cartStore.setError(e?.message ?? 'Failed to load cart'),
    });
  }

  submit() {
    const cartId = this.cartStore.cartId();
    if (!cartId) {
      this.stateSignal.set('error');
      this.errorSignal.set('No cart found. Please add items first.');
      return;
    }

    const cart = this.cartStore.cart();
    if (!cart || cart.items.length === 0) {
      this.stateSignal.set('error');
      this.errorSignal.set('Your cart is empty.');
      return;
    }

    this.stateSignal.set('submitting');
    this.errorSignal.set(null);

    this.api.checkout(cartId, { customer_email: this.email || null }).subscribe({
      next: (order) => {
        this.orderSignal.set(order);
        this.stateSignal.set('success');
        // Clear local cart state so new shopping session starts clean
        this.cartStore.reset();
      },
      error: (e) => {
        this.stateSignal.set('error');
        this.errorSignal.set(e?.message ?? 'Checkout failed');
      },
    });
  }

  backToHome() {
    this.router.navigateByUrl('/');
  }
}
