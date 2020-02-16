import React, { useState, useEffect } from 'react'
import { Input, Textbox, Text, Button } from 'components'
import style from './item.module.scss'

export default function Item({
  label,
  input,
  text,
  button,
  accent = false,
  custom,
  children,
  hint,
  onChange,
  required = false,
  error = false,
  inputType,
}) {
  const [value, setValue] = useState(input || text)

  useEffect(() => {
    setValue(input || text)
  }, [input, text])

  function handleChange(v) {
    setValue(v)
    if (onChange) onChange(v)
  }

  const Action =
    input !== undefined ? Input : text !== undefined ? Textbox : undefined

  const id = label.replace(/\s/g, '')
  return (
    <div className={style.item}>
      <label htmlFor={id}>
        {label}
        {!required ? '' : <span> *</span>}
      </label>
      {Action && !button && (
        <Action
          id={id}
          value={value}
          onChange={handleChange}
          error={error}
          {...(inputType && { type: inputType })}
        />
      )}
      {(button || custom) && (
        <div className={style.btWrap}>
          <Text>{children}</Text>
          {button && (
            <Button onClick={onChange} accent={accent}>
              {button}
            </Button>
          )}
          {custom}
        </div>
      )}
      {hint && <p className={style.hint}>{hint}</p>}
    </div>
  )
}
