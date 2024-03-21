import { Typography } from "@mui/material";
import style from './footer.module.css'

export default function Footer(){
  return (
    <footer className={style.footer}>
      <form id='donate' action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
          <input type="hidden" name="cmd" value="_s-xclick" />
          <input type="hidden" name="hosted_button_id" value="5Q4B7BZGQ3FWW" />
          <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif" style={{border:0}} name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
          <img alt="" style={{border:0}} src="https://www.paypal.com/en_CA/i/scr/pixel.gif" width="1" height="1" />
      </form>
      <Typography fontWeight={'bold'} variant="body1">Mind Knight and its developer are not associated with NOMOON Ltd.</Typography>
      <Typography fontWeight={'bold'} variant="body1">Made by <a href="#">Nik</a></Typography>
    </footer>
  )
}