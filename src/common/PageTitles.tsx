import { Box, BoxProps, Typography } from '@mui/material'

interface Props extends BoxProps {
  title: string
  subtitle?: string
}

export default function PageTitles({ title, subtitle, ...rest }: Props) {
  return (
    <Box {...rest}>
      <Typography variant='h3'>{title}</Typography>
      <Typography variant='subtitle3' mt={2}>
        {subtitle}
      </Typography>
    </Box>
  )
}
