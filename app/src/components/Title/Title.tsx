import { Box, Stack, SxProps, Theme, Typography } from '@mui/material';
import style from './title.module.css'

type Props = {
  sx?: SxProps<Theme>,
  main: React.ReactNode,
  secondary?: React.ReactNode,
  tertiary?: React.ReactNode,
}

export default function Title({ sx, main, secondary, tertiary}:Props){
  return (
    <Stack sx={sx} className={style.titleContainer} alignItems='center'>
      <Typography variant='h1'>{main}</Typography>
      <Typography style={{textTransform:'uppercase', letterSpacing: '1px'}} variant='h2'>{secondary}</Typography>
      <Typography variant='h3'>{tertiary}</Typography>
    </Stack>
  );
}