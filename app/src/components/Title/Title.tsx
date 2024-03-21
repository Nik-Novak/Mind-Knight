import { Box, Typography } from '@mui/material';
import style from './title.module.css'

type Props = {
  main: React.ReactNode,
  secondary?: React.ReactNode,
  tertiary?: React.ReactNode,
}

export default function Title({main, secondary, tertiary}:Props){
  return (
    <Box className={style.titleContainer}>
      <Typography variant='h1'>{main}</Typography>
      <Typography style={{textTransform:'uppercase', letterSpacing: '1px'}} variant='h2'>{secondary}</Typography>
      <Typography variant='h3'>{tertiary}</Typography>
    </Box>
  );
}