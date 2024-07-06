import { Column, Header, RowData, Table } from '../../types'
import { Header_CoreProperties } from './Headers.types'

export function _createHeader<TData extends RowData, TValue>(
  table: Table<TData>,
  column: Column<TData, TValue>,
  options: {
    id?: string
    isPlaceholder?: boolean
    placeholderId?: string
    index: number
    depth: number
  },
): Header<TData, TValue> {
  const header: Header_CoreProperties<TData, TValue> = {
    colSpan: 0,
    column,
    depth: options.depth,
    headerGroup: null!,
    id: options.id ?? column.id,
    index: options.index,
    isPlaceholder: !!options.isPlaceholder,
    placeholderId: options.placeholderId,
    rowSpan: 0,
    subHeaders: [],
  }

  table._features.forEach((feature) => {
    feature._createHeader?.(header as Header<TData, TValue>, table)
  })

  return header as Header<TData, TValue>
}
