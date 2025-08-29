import React, { useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { postRequest } from "../../config/AxiosRoutes/index"
import dateicon from "../../images/Chips Icons Mobile.png";
import timeicon from "../../images/Chips Icons Mobile (1).png";
import membericon from "../../images/Chips Icons Mobile (3).png";
import resturanticon from "../../images/table_restaurant.png";
import logo1 from "../../images/Logo (1).png";
import sectionimg2 from "../../images/Tap & Run_MainImage 1.png";
import styles from "./TopConfirm.module.css";
import { Link, useNavigate } from "react-router-dom";
import CustomCheckbox from '../../components/ui/CustomCheckbox/CustomCheckbox';
import PubImageHeader from '../../components/PubImageHeader/PubImageHeader';
import InfoChip from '../../components/InfoChip/InfoChip';
import Indicator from '../../components/Indicator/Indicator';
import CustomButton from '../../components/ui/CustomButton/CustomButton';
import { addSuccessBookingData, updateCustomerDetails } from '../../store/bookingSlice';
import PaymentModal from '../../components/PaymentModal/PaymentModal';
import Toast from '../../components/Toast/Toast';
import PrivacyPolicyModal from '../../components/PrivacyPolicyModal';

export default function Confirm() {
  const navigate = useNavigate();

  // Get state from Redux
  const bookingState = useSelector((state) => state.booking);
  const {
    date,
    time,
    adults,
    children,
    selectedPromotion,
    customerDetails,
    specialRequests
  } = bookingState;

  console.log("bookingState", bookingState);

  // Format date for display

  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [bookingResponse, setBookingResponse] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [showPrivacyPolicyModal, setShowPrivacyPolicyModal] = useState(false);

  const displayDate = React.useMemo(() => {
    if (!date) return "Select Date";
    try {
      const [year, month, day] = date.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      return dateObj.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return "Select Date";
    }
  }, [date]);

  const handleBooking = async () => {
    setIsLoading(true);
    setError('');
    
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
      // First API call without payment method
      const encodedData = toUrlEncoded(submissionData);
      const response = await postRequest(
        '/api/ConsumerApi/v1/Restaurant/CatWicketsTest/BookingWithStripeToken',
        headers,
        encodedData
      );
      
      console.log('Booking Response:', response.data);
      
      // Check response status and handle accordingly
      switch (response.data.Status) {
        case 'CreditCardRequired':
          // Show payment modal with Stripe setup
          setBookingResponse(response.data);
          setPaymentStatus('CreditCardRequired');
          setShowPaymentModal(true);
          break;
        case 'PaymentRequired':
          // Handle payment required flow
          setBookingResponse(response.data);
          setPaymentStatus('PaymentRequired');
          setShowPaymentModal(true);
          break;
        case 'Success':
          // Direct success - navigate to booked page
          dispatch(addSuccessBookingData(response.data));
          navigate('/topBooked');
          break;
        default:
          setError('Unexpected response status. Please try again.');
          console.error('Unexpected status:', response.data.Status);
      }
    } catch (error) {
      console.error('Booking Failed:', error);
      setError('Booking failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  // const handleBooking = async () => {
  //   setIsLoading(true);


  // };

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
      navigate('/topBooked');
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
        sectionImg={sectionimg2}
        pubLinkLabel="CHOOSE ANOTHER PUB"
        step={4}
        stepLength={4}
        pubLink="/Select"
      />
      <div className={styles.ConfirmMainContainer}>
        <div className={styles.Data_type}>
          <h1 className={`${styles.logo_large} ${styles.datetilte}`}>Confirm Your Details Below</h1>
          <h6 className={styles.subtext}>You Are About To Place A Booking At:</h6>
        </div>
        <img className={styles.confirmLogo} src={logo1} alt="logo" />
        <h5 className={styles.bookingInfo}>Your Booking Info</h5>
        <div className={styles.Data_type} id="Data_type1">
          <InfoChip icon={dateicon} label={displayDate} alt="date_icon" />
          <InfoChip icon={timeicon} label={time || "Select Time"} alt="time_icon" />
          <InfoChip icon={membericon} label={`${parseInt(adults) + parseInt(children)}` || "Select Party Size"} alt="member_icon" />
          <InfoChip icon={resturanticon} label={selectedPromotion?.Name || "Select Area"} alt="react_icon" />
        </div>

        {error && (
          <div className={styles.errorMessage}>
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
            Your table is required to be returned by {bookingState.returnBy || "XX:XX PM"}
          </div>
        </div>

        <div className={styles.confirmCheckbox}>
          <CustomCheckbox
            checked={customerDetails.ReceiveEmailMarketing}
            id="flexCheckDefault"
            label={
              <span>
                I have read and accept the{' '}
                <button
                  type="button"
                  className={styles.privacyPolicyLink}
                  onClick={() => setShowPrivacyPolicyModal(true)}
                >
                  Privacy Policy
                </button>
              </span>
            }
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
            disabled={isLoading}
          />
          <CustomButton
            label="BACK"
            to="/TopDetails"
            color="#FFFFFF"
            bgColor="#C39A7B"
          />
        </div>

        <div className={styles.changeTopMainn}>
          <Indicator step={4} stepLength={4} />
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

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={handleCloseModal}
        bookingData={{
          VisitDate: date,
          VisitTime: time,
          PartySize: parseInt(adults) + parseInt(children),
          PromotionId: selectedPromotion?.Id,
          PromotionName: selectedPromotion?.Name,
          SpecialRequests: specialRequests,
          Customer: customerDetails,
          ChannelCode: 'ONLINE',
          IsLeaveTimeConfirmed: true
        }}
        bookingResponse={bookingResponse}
        paymentStatus={paymentStatus}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={showPrivacyPolicyModal}
        onClose={() => setShowPrivacyPolicyModal(false)}
        pageType="top"
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
