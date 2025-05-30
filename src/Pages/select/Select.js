import React, { useEffect } from "react";
import chooseimg from "../../images/Left Container The Cat and Wickets.png";
import topandrunlogo from "../../images/Logo (1).png";
import logo from "../../images/Griffin Black.png";
import { Link } from "react-router-dom";
import styles from "./Select.module.css";
import PubImageHeader from '../../components/PubImageHeader/PubImageHeader';
import CustomButton from '../../components/ui/CustomButton/CustomButton';
import { useDispatch } from 'react-redux';
import { resetBooking } from '../../store/bookingSlice';
export default function Select() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(resetBooking());
  },[])

  return (
    <div className={styles.selectMain} id="choose">
      {/* <div className="chooseimgmain">
        <img src={chooseimg} alt="section_image" className="choose_imag" />
      </div> */}
      <PubImageHeader
        sectionImg={chooseimg}

      />
      <div className={styles.select_container}>
        <div className={styles.select_typee}>
          <h1 className={styles.logo_large}>
            We Can't Wait For You <br />
            To Join Us!
          </h1>
        </div>
        <div className={styles.select_typee}>
          <img src={topandrunlogo} alt="Logo_Top&Run" className={styles.logos} />
          <p className={styles.texttoprun}>
            Main Road, Upper Broughton, Melton Mowbray <br /> LE14 3BG, United
            Kingdom
          </p>
          <a href="tel:+441664820407" className={styles.numbrtag}>
            +441664820407
          </a>


          <CustomButton
            label="SELECT"
            to="/topandrun"
            bgColor="#C39A7B"
            color="#FFFCF7"
          />
        </div>
        <div className={styles.select2}></div>
        <div className={styles.select_typee}>
          <img className={styles.logos2} src={logo} alt="Logo_Top&Run" />
          <p className={styles.texttoprun}>
            174 Main St, Swithland, Leicester LE12 8TJ, United <br /> Kingdom
          </p>
          <a href="tel:+441509890535" className={styles.numbrtag}>
            +441509890535
          </a>


          <CustomButton
            label="SELECT"
            to="/griffin"
            bgColor="#C39A7B"
            color="#FFFCF7"
          />
        </div>
        <div className={styles.select_typee}>
          <Link to="/" className='exist__link'>
            Back To The Site
          </Link>
        </div>
      </div>
    </div>
  );
}
