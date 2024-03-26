import {
  FormControl,
  FormHelperText,
  FormLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  SelectProps,
  Stack,
} from '@mui/material'
import { forwardRef, ReactNode, useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'

type Props = Omit<SelectProps<string>, 'error'> & {
  options: {
    value: string
    label: string
    adornmentLeft?: ReactNode
    adornmentRight?: ReactNode
  }[]
  updateValue?: (value: string) => void
  errorMessage?: string
}

const UiSelect = forwardRef(
  ({ options, label, updateValue, errorMessage, ...rest }: Props, ref) => {
    const id = useMemo(() => rest.id ?? `ui-select-field-${uuidv4()}`, [rest.id])

    const labelId = useMemo(() => rest.labelId ?? `${id}-label`, [id, rest.labelId])

    const handleChange = (e: SelectChangeEvent<string>, child: ReactNode) => {
      updateValue?.(e.target.value as string)

      rest?.onChange?.(e, child)
    }

    return (
      <FormControl fullWidth error={!!errorMessage}>
        {label && (
          <FormLabel id={labelId} sx={{ mb: 2 }}>
            {label}
          </FormLabel>
        )}

        <Select
          {...rest}
          inputRef={ref}
          id={id}
          labelId={labelId}
          value={rest.value || ''}
          onChange={handleChange}
        >
          {options.map(({ value, label, adornmentLeft, adornmentRight }, idx) => (
            <MenuItem key={idx} value={value}>
              <Stack
                direction='row'
                spacing={1}
                flex={1}
                alignItems='center'
                justifyContent='flex-start'
              >
                {adornmentLeft}
                {label}
                {adornmentRight}
              </Stack>
            </MenuItem>
          ))}
        </Select>

        {errorMessage && <FormHelperText>Error</FormHelperText>}
      </FormControl>
    )
  },
)

export default UiSelect
