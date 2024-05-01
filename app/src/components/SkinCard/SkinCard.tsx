"use client";
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import MUIAvatar from '@mui/material/Avatar';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LockIcon from '@mui/icons-material/Lock';
import Avatar from '../Avatar';
import { Prisma } from '@prisma/client';
import _ from 'lodash';
import FormButton from '../FormButton';
import { approveSkin, equipSkin, revokeSkinApproval, unequipSkin } from '@/actions/skins';
import { useNotificationQueue } from '../NotificationQueue';
import Notification from '../Notification';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import CustomSkinStats from '../CustomSkinStats';
import { CustomSkinInfoPayload } from '@/types/skins';
import { getDarkenedImage } from '@/utils/functions/general';

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

function isSkinString(skin: string | CustomSkinInfoPayload | undefined): skin is string {
  return typeof skin === 'string';
}
// function isSkinLocked(skin: string | CustomSkinInfoPayload | undefined): skin is undefined {
//   return typeof skin === 'undefined';
// }

// type Props = {
//   customSkin:CustomSkinInfoPayload,
//   equipped?: boolean,
//   renderContext?: 'admin'
// }
type Props = {
  skin: string|CustomSkinInfoPayload; //string is ingame skin, CustomSkin is the other
  isLocked?:boolean;
  equipped?: boolean;
  renderContext?:'admin';
}

export default function SkinCard({ skin, isLocked=false, equipped=false, renderContext }:Props) {
  const [expanded, setExpanded] = useState(false);
  const [darkenedImage, setDarkenedImage] = useState(`/img/skins/_locked.png`);
  const { pushNotification } = useNotificationQueue();
  const router = useRouter();
  // const isLocked = isSkinLocked(skin);
  const isCustom = !isSkinString(skin);
  // const skinName = isLocked ? '' : _.startCase(!isCustom ? skin : skin?.name);
  const casedSkinName = isLocked ? '?????' : _.startCase(!isCustom ? skin : skin?.name);
  
  useEffect(()=>{
    if(isCustom && isLocked)
      getDarkenedImage(skin.base64_data).then(darkened=>setDarkenedImage(darkened))
  }, []);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const actions:ReactNode[] = [];
  if(!isLocked){
    
    if(isCustom){
      if(renderContext === 'admin'){
        actions.push(
          <form key='approve' action={async (data)=>{
            try{
              if(!skin.approved)
                await approveSkin(skin.name);
              else 
                await revokeSkinApproval(skin.name);
              pushNotification(<Notification>{!skin.approved ? 'Approved' :'Revoked approval'} {casedSkinName}</Notification>);
              //revalidatePath('/skins') //TODO: fix
              router.refresh();
            } catch(err){
              if(err instanceof Error)
              pushNotification(<Notification severity='error'>Something went wrong: {err.message}</Notification>)
            }
          }}>
            <FormButton variant='contained' className='pixel-corners-small'>{!skin.approved ? 'Approve' :'Revoke Approval'}</FormButton>
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
      }
    }
    if(renderContext!=='admin')
      actions.push(
        <form key='equip' action={async (data)=>{
          try{
            if(!equipped)
              await equipSkin(isCustom ? skin.name : skin);
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
  else{
    actions.push(<IconButton><LockIcon color='error' /></IconButton>)
  }

  return (
    <Card sx={{ maxWidth: 345, boxShadow: equipped ? '0 0 5px 2px grey' : undefined }}>
      { isCustom && 
        <CardHeader
          avatar={
            <MUIAvatar src={skin?.owner.user?.image||undefined } sx={{cursor:'pointer'}} variant="square">
              { isLocked ? '?' : skin.owner.user?.name?.charAt(0).toUpperCase() }
            </MUIAvatar>
          }
          action={
            <IconButton aria-label="settings">
              <MoreVertIcon />
            </IconButton>
          }
          title={ isLocked ? '?????' : skin.owner.name}
          subheader={ isLocked ? '?????' : skin.created_at.toDateString()}
        />
      }
      <CardMedia
        sx={{imageRendering:'pixelated'}}
        component="img"
        image={isCustom ? isLocked ? darkenedImage : skin.base64_data : `/img/skins/${skin}.png`}
        alt="Skin"
      />
      <CardContent>
        <Typography textAlign={'center'} variant="body1">
          {casedSkinName}
        </Typography>
        {isLocked && 
          <Typography textAlign={'center'} variant="body1">
            (beat this player in a 1v1)
          </Typography>
        }
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
          <Typography paragraph>{ isLocked ? '?'.repeat(17) : isCustom ? skin.description : "(can someone please help me get all the descriptions from ingame skins? ty)"}</Typography>
          {isCustom && <CustomSkinStats customSkin={skin} isLocked={isLocked} /> }
        </CardContent>
      </Collapse>
    </Card>
  );
}