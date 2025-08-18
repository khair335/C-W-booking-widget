import React, { useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
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
import { addSuccessBookingData, updateCustomerDetails } from '../../store/bookingSlice';
import PaymentModal from '../../components/PaymentModal/PaymentModal';
import Toast from '../../components/Toast/Toast';

export default function Confirm() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get state from Redux
  const bookingState = useSelector((state) => state.booking);
  console.log('bookingState', bookingState);
  const { date, time, adults, children, selectedPromotion, customerDetails, specialRequests } = bookingState;

  // Local state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [transactionId, setTransactionId] = useState('');

  const handleBooking = async () => {
    // Show payment modal instead of direct booking
  console.log('selectedPromotion',selectedPromotion);
    if(selectedPromotion?.MayRequireCreditCard){
      setShowPaymentModal(true);
    }else{
      setIsLoading(true);
      const token = localStorage.getItem('token');

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      };
  
      const submissionData = {
        VisitDate: date,
        VisitTime: time,
        PartySize: parseInt(adults) + parseInt(children),
        PromotionId: selectedPromotion?.Id,
        PromotionName: selectedPromotion?.Name,
        SpecialRequests: specialRequests,
        Customer: customerDetails,
        ChannelCode: 'ONLINE',
        IsLeaveTimeConfirmed: true
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
        if (response.data.Booking) {
          dispatch(addSuccessBookingData(response.data));
          // dispatch(resetBooking());
          navigate('/topBooked');
        } else {
          setError('Something went wrong,Please try again to book a table');
        }
      } catch (error) {
        console.error('Booking Failed:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePaymentSuccess = (responseData) => {
    dispatch(addSuccessBookingData(responseData));
    setShowPaymentModal(false);

    // Show toast with transaction ID
    const txId = responseData.transactionId ||
                 responseData.Booking?.Reference ||
                 'N/A';

    setTransactionId(txId);
    setToastMessage('Payment successful! Your booking has been confirmed.');
    setShowToast(true);

    // Navigate after a short delay to show the toast
    setTimeout(() => {
      navigate('/Booked');
    }, 2000);
  };

  const handlePaymentError = (error) => {
    setError(error);
    setShowPaymentModal(false);

    // Show error toast
    setToastMessage(error || 'Payment failed. Please try again.');
    setShowToast(true);
  };

  const handleCloseModal = () => {
    setShowPaymentModal(false);
  };

  const handleToastClose = () => {
    setShowToast(false);
  };

  return (
    <div className={styles.ConfirmMain} id="choose">

      <PubImageHeader
        // pubLogo={logo}
        sectionImg={sectionimage}
        pubLinkLabel="CHOOSE ANOTHER PUB"
        step={4}
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


          <InfoChip icon={dateicon} label={date || "Select Date"} alt="date_icon" />
          <InfoChip icon={timeicon} label={time || "Select Time"} alt="time_icon" />
          <InfoChip icon={membericon} label={(adults + children) || "Select Party Size"} alt="member_icon" />
          <InfoChip icon={resturanticon} label={selectedPromotion?.Name || "Select Area"} alt="react_icon" />
        </div>

        {error && (
          <div style={{ color: 'red', marginBottom: '1rem', fontWeight: 'bold' }}>
            {error}
          </div>
        )}

        <div className={`${styles.Data_type} ${styles.inputmain}`}>
          <div className={styles.confirmedData}>
            <p className={styles.confirmedDatatype}>
              First Name: &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;{" "}
              <span className={styles.namedata}>{customerDetails.FirstName}</span>
            </p>
          </div>
          <div className={styles.confirmedData}>
            <p className={styles.confirmedDatatype}>
              Last Name: &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;{" "}
              <span className={styles.namedata}>{customerDetails.Surname}</span>
            </p>
          </div>
          <div className={styles.confirmedData}>
            <p className={styles.confirmedDatatype}>
              Mobile Number: &nbsp; &nbsp; &nbsp;
              <span className={styles.namedata}>{customerDetails.Mobile}</span>
            </p>
          </div>
          <div className={`${styles.confirmedData} ${styles.emaildata}`}>
            <p className={styles.confirmedDatatype}>
              Email Address: &nbsp; &nbsp; &nbsp; &nbsp;
              <span className={styles.namedata}>{customerDetails.Email}</span>
            </p>
          </div>
          <section className={styles.commentSection}>
            <h4 className={styles.comt}>Comment</h4>
            <div className={styles.commentsdata}>
              {specialRequests || "No Comment"}
            </div>
          </section>

          <div className={styles.tableReturnInfo}>
            Your table is required to be returned by 8:45 PM
          </div>
        </div>

        <div className={styles.confirmCheckbox}>
          <CustomCheckbox
            checked={customerDetails.ReceiveEmailMarketing}
            id="flexCheckDefault"
            label="I have read and accept the Privacy Policy"
            onChange={(e) =>
              dispatch(
                updateCustomerDetails({ ReceiveEmailMarketing: e.target.checked })
              )
            }
            labelStyle={styles.confirmCheckboxLabel}

          />
        </div>
        <div className={`${styles.Data_type} ${styles.ConfirmbtonMain}`}>


          <CustomButton
            label="Proceed to Payment"
            onClick={handleBooking}
            disabled={isSubmitting}
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
          <Link to="/" className='exist__link'>
            Exit And Cancel Booking
          </Link>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={handleCloseModal}
        bookingData={{
          VisitDate: date,
          VisitTime: time,
          PartySize: adults + children,
          PromotionId: selectedPromotion?.Id,
          PromotionName: selectedPromotion?.Name,
          SpecialRequests: specialRequests,
          Customer: customerDetails,
          ChannelCode: 'ONLINE',
          IsLeaveTimeConfirmed: true
        }}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />

      {/* Toast Notification */}
      <Toast
        isVisible={showToast}
        message={toastMessage}
        title={transactionId ? "Payment Successful!" : "Payment Status"}
        type={transactionId ? "success" : "error"}
        transactionId={transactionId}
        onClose={handleToastClose}
      />
    </div>
  );
}
