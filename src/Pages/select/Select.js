import React from "react";
import chooseimg from "../../images/Left Container The Cat and Wickets.png";
import topandrunlogo from "../../images/Logo (1).png";
import logo from "../../images/Griffin Black.png";
import { Link } from "react-router-dom";
import "./Select.css";
export default function Select() {

  return (
    <div className="selectMain" id="choose">
      <div className="chooseimgmain">
        <img src={chooseimg} alt="section_image" className="choose_imag" />
      </div>
      <div className="selectmain">
        <div className="select_typee">
          <h1 className="logo-large">
            We Can't Wait For You <br />
            To Join Us!
          </h1>
        </div>
        <div className="select_typee">
          <img src={topandrunlogo} alt="Logo_Top&Run" className="logos" />
          <p className="texttoprun">
            Main Road, Upper Broughton, Melton Mowbray <br /> LE14 3BG, United
            Kingdom
          </p>
          <a href="tel:+441664820407" className="numbrtag">
            +441664820407
          </a>
          <Link
            to="/topandrun"
            className="selctbtn"
          >
            
            SELECT
          </Link>
        </div>
        <div className="select2"></div>
        <div className="select_typee">
          <img src={logo} alt="Logo_Top&Run" />
          <p className="texttoprun">
            174 Main St, Swithland, Leicester LE12 8TJ, United <br /> Kingdom
          </p>
          <a href="tel:+441509890535" className="numbrtag">
            +441509890535
          </a>
          <Link
            to="/griffin"
            className="selctbtn"
          >
            SELECT
          </Link>
        </div>
        <div className="select_typee">
          <Link to="/" className="Existlink">
            Back To The Site
          </Link>
        </div>
      </div>
    </div>
  );
}
