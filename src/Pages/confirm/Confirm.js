import React from "react";
import { postRequest } from "../../config/AxiosRoutes/index"
import logo from "../../images/Griffin Black.png";
import sectionimage from "../../images/79205c0e916b529d8d136ce69e32e592.png";
import dateicon from "../../images/Chips Icons Mobile.png";
import timeicon from "../../images/Chips Icons Mobile (1).png";
import membericon from "../../images/Chips Icons Mobile (3).png";
import resturanticon from "../../images/table_restaurant.png";
import styles from "./Confirm.module.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import CustomCheckbox from '../../components/ui/CustomCheckbox/CustomCheckbox';
import PubImageHeader from '../../components/PubImageHeader/PubImageHeader';
import InfoChip from '../../components/InfoChip/InfoChip';
import Indicator from '../../components/Indicator/Indicator';
import CustomButton from '../../components/ui/CustomButton/CustomButton';


export default function Confirm() {
  const location = useLocation();
  const navigate = useNavigate();
  const submissionData = location.state;

  const handleBooking = async () => {
    const token = localStorage.getItem('token');

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    const toUrlEncoded = (obj, prefix) => {
      const str = [];
      for (const p in obj) {
        if (obj.hasOwnProperty(p)) {
          const key = prefix ? `${prefix}[${p}]` : p;
          const value = obj[p];
          if (typeof value === 'object' && value !== null) {
            str.push(toUrlEncoded(value, key));
          } else {
            str.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
          }
        }
      }
      return str.join('&');
    };

    try {
      const encodedData = toUrlEncoded(submissionData);
      const response = await postRequest(
        '/api/ConsumerApi/v1/Restaurant/CatWicketsTest/BookingWithStripeToken',
        headers,
        encodedData
      );
      console.log('Booking Success:', response.data);
      navigate('/booked');
    } catch (error) {
      console.error('Booking Failed:', error);
    }
  };

  return (
     <div className={styles.ConfirmMain} id="choose">

      <PubImageHeader
        // pubLogo={logo}
        sectionImg={sectionimage}
        pubLinkLabel="CHOOSE ANOTHER PUB"
        step={3}
        pubLink="/Select"
      />
      <div className={styles.ConfirmMainContainer}>
        <div className={styles.Data_type}>
          <h1 className={`${styles.logo_large} ${styles.datetilte}`}>Confirm Your Details Below</h1>
          <h6 className="confirm-text">You Are About To Place A Booking At:</h6>
        </div>
        <img className={styles.confirmLogo} src={logo} alt="logo" />
        <h5 className={styles.bookingInfo}>Your Booking Info</h5>
        <div className={styles.Data_type} id="Data_type1">


          <InfoChip icon={dateicon} label={submissionData.VisitDate || "Select Date"} alt="date_icon" />
          <InfoChip icon={timeicon} label={submissionData.VisitTime || "Select Time"} alt="time_icon" />
          <InfoChip icon={membericon} label={submissionData.PartySize || "Select Party Size"} alt="member_icon" />
          <InfoChip icon={resturanticon} label={submissionData?.PromotionName || "Select Area"} alt="react_icon" />
        </div>


        <div className={`${styles.Data_type} ${styles.inputmain}`}>
          <div className={styles.confirmedData}>
            <p className={styles.confirmedDatatype}>
              First Name: &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;{" "}
              <span className={styles.namedata}>{submissionData.Customer.FirstName}</span>
            </p>
          </div>
          <div className={styles.confirmedData}>
            <p className={styles.confirmedDatatype}>
              Last Name: &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;{" "}
              <span className={styles.namedata}>{submissionData.Customer.Surname}</span>
            </p>
          </div>
          <div className={styles.confirmedData}>
            <p className={styles.confirmedDatatype}>
              Mobile Number: &nbsp; &nbsp; &nbsp;
              <span className={styles.namedata}>{submissionData.Customer.Mobile}</span>
            </p>
          </div>
          <div className={`${styles.confirmedData} ${styles.emaildata}`}>
            <p className={styles.confirmedDatatype}>
              Email Address: &nbsp; &nbsp; &nbsp; &nbsp;
              <span className={styles.namedata}>{submissionData.Customer.Email}</span>
            </p>
          </div>
          <section className={styles.commentSection}>
            <h4 className={styles.comt}>Comment</h4>
            <div className={styles.commentsdata}>
              {submissionData.SpecialRequests || "No Comment"}
            </div>
          </section>

          <div className={styles.tableReturnInfo}>
            Your table is required to be returned by 8:45 PM
          </div>
        </div>

        <div className={styles.confirmCheckbox}>
          <CustomCheckbox
            checked={submissionData.Customer.ReceiveEmailMarketing}
            id="flexCheckDefault"
            label="I have read and accept the Privacy Policy"
            labelStyle={styles.confirmCheckboxLabel}
          />
        </div>
        <div className={`${styles.Data_type} ${styles.ConfirmbtonMain}`}>


          <CustomButton
            label="Book a table"
            onClick={handleBooking}

          />
            <CustomButton
            label="BACK"
            to="/Details"
            color="#FFFFFF"
            bgColor="#C39A7B"
          />



        </div>
        <div className={styles.changeTopMainn}>
          <Indicator step={4} />
        </div>
        <div className={styles.Area_type_footer}>
          <div className={styles.chose_m_link}>
            <Link to="/Select" className='chose__another__link'>
              CHOOSE ANOTHER PUB
            </Link>
          </div>
          <Link to="/TopHome" className='exist__link'>
            Exit And Cancel Booking
          </Link>
        </div>
      </div>
    </div>
  );
}
