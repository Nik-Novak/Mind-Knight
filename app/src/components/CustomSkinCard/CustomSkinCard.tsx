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
import { CustomSkin, Prisma } from '@prisma/client';
import _ from 'lodash';
import { Button } from '@mui/material';
import FormButton from '../FormButton';
import { approveSkin, equipSkin, revokeSkinApproval, unequipSkin } from '@/actions/skins';
import { useNotificationQueue } from '../NotificationQueue';
import Notification from '../Notification';
import { revalidatePath } from 'next/cache';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

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
  customSkin:Prisma.CustomSkinGetPayload<{include:{owner:true}}>,
  equipped?: boolean,
  renderContext?: 'admin'
}
export default function CustomSkinCard({ customSkin, equipped=false, renderContext }:Props) {
  const [expanded, setExpanded] = React.useState(false);
  const { pushNotification } = useNotificationQueue();
  const router = useRouter();

  const casedSkinName =_.startCase(customSkin.name);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const actions:ReactNode[] = [];
  if(renderContext === 'admin'){
    actions.push(
    <form key='approve' action={async (data)=>{
      try{
        if(!customSkin.approved)
          await approveSkin(customSkin.name);
        else 
          await revokeSkinApproval(customSkin.name);
        pushNotification(<Notification>{!customSkin.approved ? 'Approved' :'Revoked approval'} {casedSkinName}</Notification>);
        //revalidatePath('/skins') //TODO: fix
        router.refresh();
      } catch(err){
        if(err instanceof Error)
        pushNotification(<Notification severity='error'>Something went wrong: {err.message}</Notification>)
      }
    }}>
      <FormButton variant='contained' className='pixel-corners-small'>{!customSkin.approved ? 'Approve' :'Revoke Approval'}</FormButton>
    </form>
    );
  }
  else {
    actions.push(
    <IconButton key='favorite' aria-label="add to favorites">
      <FavoriteIcon />
    </IconButton>
    );
    actions.push(
    <IconButton key='share' aria-label="share">
      <ShareIcon />
    </IconButton>
    );
    actions.push(
    <form key='equip' action={async (data)=>{
      try{
        if(!equipped)
          await equipSkin(customSkin.name);
        else await unequipSkin();
        pushNotification(<Notification>{equipped ? 'Unequipped' :'Equipped'} {casedSkinName}</Notification>);
        //revalidatePath('/skins') //TODO: fix
        router.refresh();
      } catch(err){
        if(err instanceof Error)
        pushNotification(<Notification severity='error'>Something went wrong: {err.message}</Notification>)
      }
    }}>
      <FormButton variant='contained' className='pixel-corners-small'>{equipped ? 'Unequip' :'Equip'}</FormButton>
    </form>
    );
  }

  return (
    <Card sx={{ maxWidth: 345, boxShadow: equipped ? '0 0 5px 2px grey' : undefined }}>
      <CardHeader
        avatar={
          <Avatar />
        }
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
        title={customSkin.owner.name}
        subheader={customSkin.created_at.toDateString()}
      />
      <CardMedia
        sx={{imageRendering:'pixelated'}}
        component="img"
        image={customSkin.base64_data}
        alt="Skin"
      />
      <CardContent>
        <Typography textAlign={'center'} variant="body1">
          {casedSkinName}
        </Typography>
        {/* <Typography sx={{mt:2}} variant="body2" color="text.secondary">
          {customSkin.description}
        </Typography> */}
      </CardContent>
      <CardActions disableSpacing>
        { actions }
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
          <Typography paragraph>{customSkin.description}</Typography>
        </CardContent>
      </Collapse>
    </Card>
  );
}