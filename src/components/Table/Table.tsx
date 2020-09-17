import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import PaginationInterface from './Pagination'
import { Icon, Title } from 'components'

type Row = { [c: string]: any }

interface Props {
  columns: string[]
  defaultColumns: string[]
  query(
    fields: string[],
    rows: number,
    offset: number,
    sortBy: string,
    sortDir: 'ASC' | 'DESC'
  ): Promise<{ rows: Row[]; total: number }>
  width?: string
  numRows?: number
  defaultSortBy: string
}

export default function Table({
  columns,
  defaultColumns,
  numRows = 25,
  width = '80vw',
  query,
  defaultSortBy,
}: Props) {
  const [selectedColumns, setSelectedColumns] = useState(defaultColumns)
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string[]>([])
  const [total, setTotal] = useState<number>()
  const [rowLimit, setRowLimit] = useState(numRows)
  const [offset, setOffset] = useState(0)
  const [sortBy, setSortBy] = useState(defaultSortBy)
  const [sortDir, setSortDir] = useState<'ASC' | 'DESC'>('ASC')

  useEffect(() => {
    setLoading(true)
    query(selectedColumns, rowLimit, offset, sortBy, sortDir).then(
      ({ rows, total }) => {
        setLoading(false)
        setRows(rows)
        setTotal(total)
      }
    )
  }, [query, selectedColumns, rowLimit, offset, sortBy, sortDir])

  function onSelect(e: React.MouseEvent<HTMLDivElement, MouseEvent>, row: Row) {
    if (!e.shiftKey || !selected.length)
      return setSelected(
        selected.includes(row.id)
          ? selected.filter(id => id !== row.id)
          : [...selected, row.id]
      )
    const ids: string[] = rows.map(({ id }) => id)
    const bounds = [selected.slice(-1)[0], row.id].map(id => ids.indexOf(id))
    if (bounds[1] > bounds[0]) bounds[1] += 1
    setSelected(
      Array.from(
        new Set([
          ...selected,
          ...ids.slice(Math.min(...bounds), Math.max(...bounds)),
        ])
      )
    )
  }

  function toggleAll() {
    const rowIds = rows.map(({ id }) => id)
    if (rowIds.every(id => selected.includes(id)))
      setSelected(selected.filter(id => !rowIds.includes(id)))
    else setSelected(Array.from(new Set([...selected, ...rowIds])))
  }

  const Pagination = (
    <PaginationInterface
      totalRows={total}
      rowLimit={rowLimit}
      setRowLimit={n => {
        setOffset(0)
        setRowLimit(n)
      }}
      offset={offset}
      setOffset={setOffset}
    />
  )
  return (
    <S.Wrap width={width} rows={numRows}>
      <S.ControlStrip>
        <S.NavItem
          aria-expanded={false}
          onClick={({ currentTarget }) =>
            currentTarget.setAttribute(
              'aria-expanded',
              (
                currentTarget.getAttribute('aria-expanded') === 'false'
              ).toString()
            )
          }
        >
          <span>Columns</span>
          <Icon icon="gear" />
          <S.Dropdown onClick={e => e.stopPropagation()}>
            <S.Customize>
              <Title size={4}>Display Columns</Title>
              <ul>
                {columns.map(name => (
                  <li key={`cl-${name}`}>
                    <input
                      type="checkbox"
                      id={`cl-${name}`}
                      checked={selectedColumns.includes(name)}
                      onChange={({ target }) => {
                        setSelectedColumns(
                          target.checked
                            ? [...selectedColumns, name]
                            : selectedColumns.filter(v => v !== name)
                        )
                      }}
                    />
                    <label htmlFor={`cl-${name}`}>{name}</label>
                  </li>
                ))}
              </ul>
            </S.Customize>
          </S.Dropdown>
        </S.NavItem>
        {Pagination}
      </S.ControlStrip>
      <S.Table columns={selectedColumns.length}>
        <S.HeaderRow>
          <S.Header clickable onClick={toggleAll}>
            <input
              type="checkbox"
              checked={rows.every(({ id }) => selected.includes(id))}
              readOnly
            />
          </S.Header>
          {selectedColumns.map(column => (
            <S.Header
              key={`title-${column}`}
              onClick={() => {
                setOffset(0)
                if (sortBy === column)
                  return setSortDir(sortDir === 'ASC' ? 'DESC' : 'ASC')
                setSortDir('ASC')
                setSortBy(column)
              }}
              data-sortdir={
                sortBy !== column || sortDir === 'DESC' ? 'ASC' : 'DESC'
              }
            >
              <span>{column}</span>
              {sortBy === column && (
                <Icon
                  icon={`arrow_${sortDir === 'ASC' ? 'down' : 'up'}` as any}
                />
              )}
            </S.Header>
          ))}
        </S.HeaderRow>
        {!loading &&
          rows.map(row => (
            <S.Row key={row.id} data-selected={selected.includes(row.id)}>
              <S.Select onClick={e => onSelect(e, row)} clickable>
                <input
                  type="checkbox"
                  checked={selected.includes(row.id)}
                  readOnly
                />
              </S.Select>
              {selectedColumns.map(column => (
                <S.Cell key={`${row.id}-${column}`}>
                  <S.Item key={`${row.id}-${column}`} data-column={column}>
                    {row[column]}
                  </S.Item>
                </S.Cell>
              ))}
            </S.Row>
          ))}
      </S.Table>
      {loading && (
        <S.LoadingPlaceholder rows={numRows}>
          {Array(numRows)
            .fill(0)
            .map((_, i) => (
              <div key={`loading-${i}`} />
            ))}
        </S.LoadingPlaceholder>
      )}
      <S.ControlStrip>{Pagination}</S.ControlStrip>
    </S.Wrap>
  )
}

const Cell = styled.div<{ clickable?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: var(--row-height);
  background-color: var(--row-color);
  box-sizing: border-box;
  padding: 0.5rem;
  overflow: hidden;
  /* stylelint-disable-next-line */
  ${({ clickable }) => (clickable ? `cursor: pointer;` : '')}
`

const Row = styled.div`
  display: contents;

  --row-color: #fff;

  &:nth-of-type(2n) {
    --row-color: #f8f8f8;
  }

  &[data-selected='true'] {
    --row-color: #cfe8fc;
  }
`

const _Table = styled.div<{ columns: number }>`
  display: grid;
  grid-template-columns: var(--row-height) ${({ columns }) =>
      'auto '.repeat(columns)};
  box-sizing: border-box;
  grid-gap: var(--border-size);
  background-color: var(--border-color);
`

const S = {
  Wrap: styled.div<{ width: string; rows: number }>`
    --grid-width: ${({ width }) => width};
    --row-height: 2.8rem;
    --border-color: #90a4ae;
    --border-size: 1px;
    --cl-action-light: #1e88e5;
    --cl-action-dark: #0d47a1;

    width: var(--grid-width);
    margin: auto;
    font-size: 0.85rem;
    box-shadow: 0 0 2px 1px #0005;
    border-radius: 0.15rem;
    user-select: none;

    input[type='checkbox'] {
      cursor: pointer;
    }
  `,

  Table: _Table,

  Row,

  HeaderRow: styled(Row)`
    --row-color: #fff;
  `,

  Select: styled(Cell)`
    input {
      display: block;
    }
  `,

  Header: styled(Cell)`
    font-weight: bold;
    text-transform: capitalize;

    &[data-sortdir='ASC'] {
      cursor: s-resize;
    }

    &[data-sortdir='DESC'] {
      cursor: n-resize;
    }

    svg {
      margin-left: auto;
      transform: scale(0.9);
      fill: var(--cl-action-dark);
    }
  `,

  Cell,

  Item: styled.span`
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow-x: hidden;
    user-select: none;

    &[data-column='role'] {
      text-transform: lowercase;
    }
  `,

  LoadingPlaceholder: styled.div<{ rows: number }>`
    & > div {
      display: block;
      width: 100%;
      height: var(--row-height);
      opacity: 0;
      animation: fade 2s linear 0s infinite;

      &:nth-of-type(2n) {
        background-color: #dceffd;
      }

      &:nth-of-type(2n + 1) {
        background-color: #cfe8fc;
      }

      /* stylelint-disable-next-line */
      ${({ rows }) =>
        Array(rows)
          .fill(0)
          .map(
            (_, i) => `
              &:nth-of-type(${i + 1}n) {
                animation-delay: ${(i / (rows * 3)) * 2}s;
              }`
          )
          .join('\n')}
    }

    @keyframes fade {
      0%,
      20% {
        opacity: 0;
      }

      10% {
        opacity: 0.8;
      }
    }
  `,

  ControlStrip: styled.div`
    display: flex;
    height: 3.5rem;
    width: 100%;
    box-sizing: border-box;
    padding-right: 1rem;

    --border: calc(2 * var(--border-size)) solid var(--border-color);

    border-bottom: var(--border);

    /* stylelint-disable-next-line */
    ${_Table} ~ & {
      border-top: var(--border);
      border-bottom: none;
    }

    ${PaginationInterface.sc} {
      margin-left: auto;
    }
  `,

  NavItem: styled.div`
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0 1em;
    border-right: var(--border-size) solid var(--border-color);
    flex-shrink: 0;
    cursor: pointer;
    position: relative;

    svg {
      margin-left: auto;
      transform: scale(0.8);
      fill: var(--cl-action-dark);
      padding-left: 0.5rem;
    }
  `,

  Dropdown: styled.div`
    display: none;
    position: absolute;
    left: 0;
    top: 100%;
    box-shadow: 0 0 2px 1px #0005;
    background: #fff;
    z-index: 10;

    *[aria-expanded='true'] > & {
      display: block;
    }
  `,

  Customize: styled.div`
    padding: 1rem;

    * {
      white-space: nowrap;
    }

    h4 {
      margin-top: 0;
    }

    ul {
      padding: 0;
      margin: 0;
    }

    li {
      list-style: none;
      display: flex;
      align-items: center;

      input {
        margin: 0;
      }

      label {
        margin-left: 0.5rem;
      }
    }
  `,
}
