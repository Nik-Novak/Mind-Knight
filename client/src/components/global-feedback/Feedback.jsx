//@ts-check
import React, {useState, useEffect} from 'react'

import Button from '../button/Button';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import Slide from '@material-ui/core/Slide';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

function Feedback({version, identity}){
  const [showVersionAlert, setShowVersionAlert] = useState(true);
  const [showSignedInToast, setShowSignedInToast] = useState(false);

  useEffect(()=>{
    if(identity.player)
      setShowSignedInToast(true)
  }, [identity.player])

  return (
    <div className="feedback-container">
      <Slide in={version.local!=version.remote && showVersionAlert} direction='down'>
        <Alert className="alert-main" severity="warning" onClose={()=>setShowVersionAlert(false)}>
          <AlertTitle>Out of Date</AlertTitle>
          Your version of MindKnight is out of date. Would you like to update?<br/>
          Your version: {version.local}<br/>
          Latest: {version.remote} <Button className="alert-button" nav="/update">Update</Button>
        </Alert>
      </Slide>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={showSignedInToast}
        autoHideDuration={6000}
        onClose={(event, reason)=>reason!=='clickaway' && setShowSignedInToast(false)}
        TransitionComponent={Slide}
        action={
          <IconButton size="small" aria-label="close" color="inherit" onClick={()=>setShowSignedInToast(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
        message={`Welcome back ${identity.player && identity.player.name}`}
      />
    </div>
  )
}

export default Feedback;