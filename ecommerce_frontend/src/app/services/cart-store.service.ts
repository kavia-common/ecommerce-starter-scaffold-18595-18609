import { Injectable, computed, effect, signal } from '@angular/core';
import { Observable, EMPTY, finalize, of, switchMap, tap } from 'rxjs';
import type { Cart, Product } from '../models/api.models';
import { ApiClientService } from './api-client.service';

type CartLoadState = 'idle' | 'loading' | 'error';

@Injectable({ providedIn: 'root' })
export class CartStoreService {
  private readonly cartIdKey = 'ecom_cart_id_v1';

  private readonly cartIdSignal = signal<number | null>(null);
  private readonly cartSignal = signal<Cart | null>(null);

  private readonly stateSignal = signal<CartLoadState>('idle');
  private readonly errorSignal = signal<string | null>(null);

  readonly cartId = computed(() => this.cartIdSignal());
  readonly cart = computed(() => this.cartSignal());
  readonly state = computed(() => this.stateSignal());
  readonly error = computed(() => this.errorSignal());

  readonly itemCount = computed(() => {
    const c = this.cartSignal();
    if (!c) return 0;
    return c.items.reduce((sum, it) => sum + (it.quantity ?? 0), 0);
  });

  readonly subtotalCents = computed(() => this.cartSignal()?.subtotal_cents ?? 0);
  readonly currencyCode = computed(() => this.cartSignal()?.currency_code ?? 'USD');

  constructor(private readonly api: ApiClientService) {
    // Load cart id from localStorage (browser only).
    // eslint may run in a context where browser globals are not defined.
    type LocalStorageLike = {
      getItem(key: string): string | null;
      setItem(key: string, value: string): void;
      removeItem(key: string): void;
    };

    try {
      const storage = (globalThis as unknown as { localStorage?: LocalStorageLike }).localStorage;
      const raw = storage?.getItem(this.cartIdKey) ?? null;
      if (raw) this.cartIdSignal.set(Number(raw));
    } catch {
      // Ignore in SSR or restricted contexts
    }

    // Persist cart id whenever it changes.
    effect(() => {
      const id = this.cartIdSignal();
      try {
        const storage = (globalThis as unknown as { localStorage?: LocalStorageLike }).localStorage;
        if (!storage) return;

        if (id) storage.setItem(this.cartIdKey, String(id));
        else storage.removeItem(this.cartIdKey);
      } catch {
        // Ignore in SSR
      }
    });
  }

  // PUBLIC_INTERFACE
  /** Ensure a cart exists, creating one if needed, then load it. */
  ensureCartLoaded(): Observable<Cart> {
    const existingId = this.cartIdSignal();
    this.stateSignal.set('loading');
    this.errorSignal.set(null);

    const obs = existingId ? of({ cart_id: existingId }) : this.api.createCart();

    return obs.pipe(
      tap((r) => this.cartIdSignal.set(r.cart_id)),
      switchMap((r) => this.api.getCart(r.cart_id)),
      tap((cart) => this.cartSignal.set(cart)),
      tap(() => this.stateSignal.set('idle')),
      finalize(() => {
        if (this.stateSignal() === 'loading') this.stateSignal.set('idle');
      }),
    );
  }

  // PUBLIC_INTERFACE
  /** Add a product to cart. */
  addToCart(product: Product, quantity = 1): Observable<Cart> {
    this.errorSignal.set(null);
    const cartId = this.cartIdSignal();

    this.stateSignal.set('loading');
    const ensure$ = cartId
      ? of(cartId)
      : this.api
          .createCart()
          .pipe(tap((r) => this.cartIdSignal.set(r.cart_id)), switchMap((r) => of(r.cart_id)));

    return ensure$.pipe(
      switchMap((id) => this.api.addItem(id, { product_id: product.id, quantity })),
      tap((cart) => this.cartSignal.set(cart)),
      tap(() => this.stateSignal.set('idle')),
    );
  }

  // PUBLIC_INTERFACE
  /** Update item quantity (must be >= 1). No-op if no cart exists. */
  updateQuantity(productId: number, quantity: number): Observable<Cart> {
    const cartId = this.cartIdSignal();
    if (!cartId) return EMPTY;

    this.errorSignal.set(null);
    this.stateSignal.set('loading');

    return this.api.updateItemQuantity(cartId, productId, { quantity }).pipe(
      tap((cart) => this.cartSignal.set(cart)),
      tap(() => this.stateSignal.set('idle')),
    );
  }

  // PUBLIC_INTERFACE
  /** Remove an item from cart. No-op if no cart exists. */
  removeItem(productId: number): Observable<Cart> {
    const cartId = this.cartIdSignal();
    if (!cartId) return EMPTY;

    this.errorSignal.set(null);
    this.stateSignal.set('loading');

    return this.api.removeItem(cartId, productId).pipe(
      tap((cart) => this.cartSignal.set(cart)),
      tap(() => this.stateSignal.set('idle')),
    );
  }

  // PUBLIC_INTERFACE
  /** Clear all items from cart. No-op if no cart exists. */
  clear(): Observable<void> {
    const cartId = this.cartIdSignal();
    if (!cartId) {
      this.cartSignal.set(null);
      this.cartIdSignal.set(null);
      return EMPTY;
    }

    this.errorSignal.set(null);
    this.stateSignal.set('loading');

    return this.api.clearCart(cartId).pipe(
      tap(() => {
        // Update local state immediately
        const current = this.cartSignal();
        if (current) this.cartSignal.set({ ...current, items: [], subtotal_cents: 0 });
      }),
      tap(() => this.stateSignal.set('idle')),
    );
  }

  // PUBLIC_INTERFACE
  /** Drop cart id and local state (used after successful checkout). */
  reset() {
    this.cartSignal.set(null);
    this.cartIdSignal.set(null);
    this.stateSignal.set('idle');
    this.errorSignal.set(null);
  }

  // PUBLIC_INTERFACE
  /** Set an error message (used by components when API throws). */
  setError(message: string) {
    this.errorSignal.set(message);
    this.stateSignal.set('error');
  }
}
