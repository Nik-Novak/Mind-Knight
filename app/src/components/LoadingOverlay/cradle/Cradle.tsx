import { CSSProperties } from "react";
import Styles from "./Cradle.module.css";
type CradleProps = {
  sx?: CSSProperties | { "--uib-color": string };
};
export default function Cradle({ sx }: CradleProps) {
  return (
    <>
      <div style={sx as CSSProperties} className={Styles.newtons_cradle}>
        <div className={Styles.newtons_cradle__dot}></div>
        <div className={Styles.newtons_cradle__dot}></div>
        <div className={Styles.newtons_cradle__dot}></div>
        <div className={Styles.newtons_cradle__dot}></div>
      </div>
    </>
  );
}
