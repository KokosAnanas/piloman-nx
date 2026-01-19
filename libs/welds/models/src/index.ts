/**
 * libs/welds/models — Публичный API библиотеки моделей домена "Реестр сварных соединений"
 *
 * Экспортирует типы, интерфейсы и DTO для использования в:
 * - Frontend (Angular): libs/welds/data-access, libs/welds/feature-welds
 * - Backend (NestJS): apps/api/src/app/welds
 *
 * @see https://nx.dev/concepts/more-concepts/library-types — Nx Library Types
 */

// Основная сущность и типы
export type {
  Weld,
  WeldingProcess,
  QualityLevel,
  WeldStatus,
  TestMethod,
  WeldConclusion,
  JointType,
} from './lib/weld.model';

// DTO для API операций
export type { CreateWeldDto, UpdateWeldDto, WeldListQuery } from './lib/weld.dto';
