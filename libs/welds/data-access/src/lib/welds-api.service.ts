/**
 * WeldsApiService — Angular HTTP клиент для работы с API сварных соединений
 *
 * Использует HttpClient для выполнения CRUD операций.
 * Типы импортируются из @piloman/welds/models.
 *
 * @see https://angular.dev/guide/http — Angular HttpClient
 * @see https://angular.dev/guide/di — Dependency Injection
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import type {
  Weld,
  CreateWeldDto,
  UpdateWeldDto,
  WeldListQuery,
} from '@piloman/welds/models';
import {HttpClient, HttpParams} from "@angular/common/http";

/**
 * API сервис для работы с реестром сварных соединений
 *
 * Методы:
 * - list() — получение списка соединений
 * - get() — получение по ID
 * - create() — создание
 * - update() — обновление
 * - remove() — удаление
 */
@Injectable({
  providedIn: 'root',
})
export class WeldsApiService {
  /**
   * HttpClient для выполнения HTTP запросов
   * Используем inject() вместо constructor injection (Angular 14+)
   *
   * @see https://angular.dev/guide/di/dependency-injection
   */
  private readonly http = inject(HttpClient);

  /**
   * Базовый URL API
   *
   * В production будет браться из environment.
   * Для разработки используем proxy (настроен в proxy.conf.json)
   * или напрямую localhost:3000/api/welds.
   *
   * TODO: перенести в environment когда будет настроен
   */
  private readonly baseUrl = '/api/welds';

  /**
   * Получение списка сварных соединений
   *
   * @param query - параметры запроса (search, page, limit)
   * @returns Observable с массивом Weld
   *
   * @example
   * // Получить все соединения
   * this.weldsApi.list().subscribe(welds => console.log(welds));
   *
   * // Поиск по номеру стыка
   * this.weldsApi.list({ search: 'ШС-001' }).subscribe(welds => ...);
   */
  list(query?: WeldListQuery): Observable<Weld[]> {
    let params = new HttpParams();

    if (query?.search) {
      params = params.set('search', query.search);
    }
    if (query?.page) {
      params = params.set('page', query.page.toString());
    }
    if (query?.limit) {
      params = params.set('limit', query.limit.toString());
    }
    // Фильтрация по названию объекта строительства
    if (query?.objectName) {
      params = params.set('objectName', query.objectName);
    }

    return this.http.get<Weld[]>(this.baseUrl, { params });
  }

  /**
   * Получение сварного соединения по ID
   *
   * @param id - MongoDB ObjectId
   * @returns Observable с Weld
   */
  get(id: string): Observable<Weld> {
    return this.http.get<Weld>(`${this.baseUrl}/${id}`);
  }

  /**
   * Создание нового сварного соединения
   *
   * @param dto - данные для создания
   * @returns Observable с созданным Weld
   */
  create(dto: CreateWeldDto): Observable<Weld> {
    return this.http.post<Weld>(this.baseUrl, dto);
  }

  /**
   * Обновление сварного соединения
   *
   * @param id - MongoDB ObjectId
   * @param dto - данные для обновления
   * @returns Observable с обновлённым Weld
   */
  update(id: string, dto: UpdateWeldDto): Observable<Weld> {
    return this.http.patch<Weld>(`${this.baseUrl}/${id}`, dto);
  }

  /**
   * Удаление сварного соединения
   *
   * @param id - MongoDB ObjectId
   * @returns Observable<void>
   */
  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
