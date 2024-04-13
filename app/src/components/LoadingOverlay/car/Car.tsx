import Styles from "./Car.module.css";
import car_svg from "./img/car.svg";
import tire_svg from "./img/tire-3.svg";

export default function Car() {
  return (
    <div className={Styles.carWrapper}>
      <img src={car_svg.src} alt="car-svg" />
      <div className={Styles.carTires}>
        <img src={tire_svg.src} alt="tire-svg" />
        <img src={tire_svg.src} alt="tire-svg" />
      </div>
    </div>
  );
}
