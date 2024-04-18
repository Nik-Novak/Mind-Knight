"use client";
import * as React from 'react';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { red } from '@mui/material/colors';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Avatar from '../Avatar';
import { Prisma } from '@prisma/client';
import _ from 'lodash';
import { Button } from '@mui/material';
import { equipSkin, unequipSkin } from '@/actions/skins';
import { useNotificationQueue } from '../NotificationQueue';
import Notification from '../Notification';
import FormButton from '../FormButton';
import { useRouter } from 'next/navigation';

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));


type Props = {
  skin: string;
  equipped?: boolean;
}
export default function SkinCard({ skin, equipped }:Props) {
  const [expanded, setExpanded] = React.useState(false);
  const { pushNotification } = useNotificationQueue();
  const router = useRouter();

  const casedSkinName =_.startCase(skin.substring(5));

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Card sx={{ maxWidth: 345, boxShadow: equipped ? '0 0 5px 2px grey' : undefined }}>
      {/* <CardHeader
        avatar={
          <Avatar />
        }
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
        title={casedSkinName}
        subheader={customSkin.created_at.toDateString()}
      /> */}
      <CardMedia
        sx={{imageRendering:'pixelated'}}
        component="img"
        image={`/img/skins/${skin}.png`}
        alt="Paella dish"
      />
      <CardContent>
        <Typography textAlign={'center'} variant="body1">
          {casedSkinName}
        </Typography>
        {/* <Typography sx={{mt:2}} variant="body2" color="text.secondary">
          {customSkin.description}
        </Typography> */}
      </CardContent>
      {/* <CardActions>
        <Button variant='contained' className='pixel-corners-small'>Equip</Button>
      </CardActions> */}
      <CardActions disableSpacing>
        <IconButton aria-label="add to favorites">
          <FavoriteIcon />
        </IconButton>
        <form action={async (data)=>{
          try{
            if(!equipped)
              await equipSkin(skin);
            else await unequipSkin();
            pushNotification(<Notification>{equipped ? 'Unequipped' :'Equipped'} {casedSkinName}</Notification>);
            //revalidatePath('/skins') //TODO: fix
            router.refresh();
          } catch(err){
            if(err instanceof Error)
            pushNotification(<Notification severity='error'>Something went wrong: {err.message}</Notification>)
          }
        }}>
          <FormButton variant='contained' className='pixel-corners-small'>{equipped ? 'Unequip' : 'Equip'}</FormButton>
        </form>
        <ExpandMore
          expand={expanded}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </ExpandMore>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Typography paragraph>(can someone please help me get all the descriptions from ingame skins? ty)</Typography>
        </CardContent>
      </Collapse>
    </Card>
  );
}