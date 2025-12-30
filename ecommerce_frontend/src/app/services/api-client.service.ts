import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { formatApiError } from '../core/api-error';
import { resolveApiBaseUrl } from '../core/api-base-url';
import type {
  AddItemRequest,
  Cart,
  CheckoutRequest,
  CreateCartResponse,
  Order,
  Product,
  UpdateItemQuantityRequest,
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class ApiClientService {
  private readonly apiBaseUrlSignal = signal<string>(resolveApiBaseUrl());

  readonly apiBaseUrl = computed(() => this.apiBaseUrlSignal());

  constructor(private readonly http: HttpClient) {}

  // PUBLIC_INTERFACE
  /** Get product catalog. */
  listProducts() {
    return this.http.get<Product[]>(`${this.apiBaseUrl()}/products`).pipe(catchError((e) => this.handleError(e)));
  }

  // PUBLIC_INTERFACE
  /** Get a single product by id. */
  getProduct(productId: number) {
    return this.http
      .get<Product>(`${this.apiBaseUrl()}/products/${productId}`)
      .pipe(catchError((e) => this.handleError(e)));
  }

  // PUBLIC_INTERFACE
  /** Create a new cart. */
  createCart() {
    return this.http
      .post<CreateCartResponse>(`${this.apiBaseUrl()}/carts`, {})
      .pipe(catchError((e) => this.handleError(e)));
  }

  // PUBLIC_INTERFACE
  /** Get cart by id. */
  getCart(cartId: number) {
    return this.http.get<Cart>(`${this.apiBaseUrl()}/carts/${cartId}`).pipe(catchError((e) => this.handleError(e)));
  }

  // PUBLIC_INTERFACE
  /** Clear cart items. */
  clearCart(cartId: number) {
    return this.http.delete<void>(`${this.apiBaseUrl()}/carts/${cartId}`).pipe(catchError((e) => this.handleError(e)));
  }

  // PUBLIC_INTERFACE
  /** Add an item to cart. */
  addItem(cartId: number, req: AddItemRequest) {
    return this.http
      .post<Cart>(`${this.apiBaseUrl()}/carts/${cartId}/items`, req)
      .pipe(catchError((e) => this.handleError(e)));
  }

  // PUBLIC_INTERFACE
  /** Update quantity for product in cart. */
  updateItemQuantity(cartId: number, productId: number, req: UpdateItemQuantityRequest) {
    return this.http
      .put<Cart>(`${this.apiBaseUrl()}/carts/${cartId}/items/${productId}`, req)
      .pipe(catchError((e) => this.handleError(e)));
  }

  // PUBLIC_INTERFACE
  /** Remove product from cart. */
  removeItem(cartId: number, productId: number) {
    return this.http
      .delete<Cart>(`${this.apiBaseUrl()}/carts/${cartId}/items/${productId}`)
      .pipe(catchError((e) => this.handleError(e)));
  }

  // PUBLIC_INTERFACE
  /**
   * Checkout the current cart and create an order.
   *
   * Backend expects cart_id as query param (?cart_id=...).
   */
  checkout(cartId: number, req: CheckoutRequest) {
    const params = new HttpParams().set('cart_id', String(cartId));
    return this.http
      .post<Order>(`${this.apiBaseUrl()}/checkout`, req, { params })
      .pipe(catchError((e) => this.handleError(e)));
  }

  private handleError(err: unknown) {
    const msg = formatApiError(err);
    const httpStatus = err instanceof HttpErrorResponse ? err.status : undefined;
    return throwError(() => ({
      message: msg,
      status: httpStatus,
      raw: err,
    }));
  }
}
