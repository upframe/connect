import subscription from 'utils/subscription'

const columnTypes = ['string', 'enum', 'number', 'object', 'list'] as const
type ColumnType = typeof columnTypes[number]

export type Column = {
  name: string
  type: ColumnType
  editable?: boolean
  values?: string[]
  fields?: Columns
  displayField?: string
  filterable?: boolean
}
export type Columns = { [k: string]: Omit<Column, 'name'> }

export class Filter {
  constructor(
    public readonly columns: Columns,
    public readonly id = Date.now() + ((Math.random() * 1e5) | 0)
  ) {}

  private _column?: string
  private _field?: string
  private _action?: string
  private _value?: string
  private _valid = false
  private readonly columnSub = subscription<string | undefined>()
  private readonly fieldSub = subscription<string | undefined>()
  private readonly actionSub = subscription<string | undefined>()
  private readonly valueSub = subscription<string | undefined>()
  private readonly validSub = subscription<boolean>()

  public get column() {
    return this._column
  }

  public set column(v: string | undefined) {
    this.columnSub._call((this._column = v))
    this.field = undefined
    this.action = undefined
    this.validCheck()
  }

  public onColumnChange = this.columnSub.subscribe

  public get field() {
    return this._field
  }

  public set field(v: string | undefined) {
    this.fieldSub._call((this._field = v))
    this.validCheck()
  }

  public onFieldChange = this.fieldSub.subscribe

  public get action() {
    return this._action
  }

  public set action(v: string | undefined) {
    this.actionSub._call((this._action = v))
    this.validCheck()
  }

  public onActionChange = this.actionSub.subscribe

  public get value() {
    return this._value
  }

  public set value(v: string | undefined) {
    this.valueSub._call((this._value = v))
    this.validCheck()
  }

  public onValueChange = this.valueSub.subscribe

  public get valid() {
    return this._valid
  }

  public set valid(v: boolean) {
    if (v === this._valid) return
    this.validSub._call((this._valid = v))
  }

  private validCheck() {
    this.valid = !!(this.column && this.action && this.value)
  }

  public onValidChange = this.validSub.subscribe

  public get type(): ColumnType {
    return this.columns[this.column as string]?.type
  }

  public get fieldType(): ColumnType {
    const type = this.type
    if (!['object', 'list'].includes(this.type)) return type
    return this.columns[this.column as string]?.fields?.[this.field as string]
      ?.type as ColumnType
  }

  static actions(type: ColumnType): string[] {
    switch (type) {
      case 'string':
        return ['equals', 'includes', 'begins_with', 'ends_with']
      case 'enum':
        return ['equal']
      case 'number':
        return ['=', '<', '>', '<=', '>=']
      default:
        throw new Error(`unknown filter type ${type}`)
    }
  }
}
