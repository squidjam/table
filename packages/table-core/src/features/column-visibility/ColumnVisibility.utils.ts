import { Row } from '../../types'
import { getMemoOptions, memo } from '../../utils'
import type { Cell, Column, RowData, Table, Updater } from '../../types'
import type { ColumnPinningPosition } from '../column-pinning/ColumnPinning.types'
import type { ColumnVisibilityState } from './ColumnVisibility.types'

export function column_toggleVisibility<TData extends RowData, TValue>(
  column: Column<TData, TValue>,
  table: Table<TData>,
  value?: boolean,
): void {
  if (column_getCanHide(column, table)) {
    table_setColumnVisibility(table, (old) => ({
      ...old,
      [column.id]: value ?? !column_getIsVisible(column, table),
    }))
  }
}

export function column_getIsVisible<TData extends RowData, TValue>(
  column: Column<TData, TValue>,
  table: Table<TData>,
) {
  const childColumns = column.columns
  return (
    (childColumns.length
      ? childColumns.some((c) => c.getIsVisible())
      : table.getState().columnVisibility[column.id]) ?? true
  )
}

export function column_getCanHide<TData extends RowData, TValue>(
  column: Column<TData, TValue>,
  table: Table<TData>,
) {
  return (
    (column.columnDef.enableHiding ?? true) &&
    (table.options.enableHiding ?? true)
  )
}

export function column_getToggleVisibilityHandler<
  TData extends RowData,
  TValue,
>(column: Column<TData, TValue>, table: Table<TData>) {
  return (e: unknown) => {
    column_toggleVisibility(
      column,
      table,
      ((e as MouseEvent).target as HTMLInputElement).checked,
    )
  }
}

export function column_getVisibleLeafColumns<TData extends RowData>(
  table: Table<TData>,
  position?: ColumnPinningPosition | 'center',
) {
  return !position
    ? table.getVisibleLeafColumns()
    : position === 'center'
      ? table.getCenterVisibleLeafColumns()
      : position === 'left'
        ? table.getLeftVisibleLeafColumns()
        : table.getRightVisibleLeafColumns()
}

export function row_getAllVisibleCells<TData extends RowData>(
  cells: Array<Cell<TData, unknown>>,
  table: Table<TData>,
) {
  return cells.filter((cell) => column_getIsVisible(cell.column, table))
}

export function row_getVisibleCells<TData extends RowData>(
  left: Array<Cell<TData, unknown>>,
  center: Array<Cell<TData, unknown>>,
  right: Array<Cell<TData, unknown>>,
) {
  return [...left, ...center, ...right]
}

export function table_makeVisibleColumnsMethod<TData extends RowData>(
  table: Table<TData>,
  key: string,
  getColumns: () => Array<Column<TData, unknown>>,
): () => Array<Column<TData, unknown>> {
  return memo(
    () => [
      getColumns(),
      getColumns()
        .filter((column) => column_getIsVisible(column, table))
        .map((d) => d.id)
        .join('_'),
    ],
    (columns) => {
      return columns.filter((column) => column_getIsVisible(column, table))
    },
    getMemoOptions(table.options, 'debugColumns', key),
  )
}

export function table_setColumnVisibility<TData extends RowData>(
  table: Table<TData>,
  updater: Updater<ColumnVisibilityState>,
) {
  table.options.onColumnVisibilityChange?.(updater)
}

export function table_resetColumnVisibility<TData extends RowData>(
  table: Table<TData>,
  defaultState?: boolean,
) {
  table_setColumnVisibility(
    table,
    defaultState ? {} : table.initialState.columnVisibility,
  )
}

export function table_toggleAllColumnsVisible<TData extends RowData>(
  table: Table<TData>,
  value?: boolean,
) {
  value = value ?? !table_getIsAllColumnsVisible(table)

  table_setColumnVisibility(
    table,
    table.getAllLeafColumns().reduce(
      (obj, column) => ({
        ...obj,
        [column.id]: !value ? !column.getCanHide() : value,
      }),
      {},
    ),
  )
}

export function table_getIsAllColumnsVisible<TData extends RowData>(
  table: Table<TData>,
) {
  return !table.getAllLeafColumns().some((column) => !column.getIsVisible())
}

export function table_getIsSomeColumnsVisible<TData extends RowData>(
  table: Table<TData>,
) {
  return table.getAllLeafColumns().some((column) => column.getIsVisible())
}

export function table_getToggleAllColumnsVisibilityHandler<
  TData extends RowData,
>(table: Table<TData>) {
  return (e: unknown) => {
    table_toggleAllColumnsVisible(
      table,
      ((e as MouseEvent).target as HTMLInputElement).checked,
    )
  }
}
