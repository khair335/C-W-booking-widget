import React, { useState } from "react";
import { getCurrentRestaurant } from '../../utils/restaurantUtils';
import { formatTimeTo12Hour } from '../../utils/dateUtils';
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
import { addSuccessBookingData, updateCustomerDetails, resetBooking } from '../../store/bookingSlice';
import PaymentModal from '../../components/PaymentModal/PaymentModal';
import Toast from '../../components/Toast/Toast';
import PrivacyPolicyModal from '../../components/PrivacyPolicyModal';
import { clearAllBookingData } from '../../utils/paymentRestoration';

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
    specialRequests,
    pubType
  } = bookingState;

  console.log("bookingState", bookingState);

  // Format date for display

  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiStatus, setApiStatus] = useState(null);
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
    setApiStatus(null);

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
      const response = {
        "Booking": {
        "Id": 535071453,
        "Reference": "B3XGNH4Y",
        "RestaurantName": "The Tap & Run",
        "VisitDate": "2026-02-08T00:00:00.0000000",
        "VisitTime": "14:00:00",
        "PartySize": 2,
        "ChannelCode": "ONLINE",
        "SpecialRequests": null,
        "PromotionId": 251054,
        "IpAddress": "52.5.155.132",
        "IsLeaveTimeConfirmed": true,
        "Customer": {
        "Id": 285892622,
        "Title": "",
        "FirstName": "Ciorstaidh",
        "Surname": "MacLeod",
        "MobileCountryCode": 44,
        "Mobile": "7721487262",
        "PhoneCountryCode": 0,
        "Phone": "",
        "Email": "ciorstaidh@resdiary.com",
        "ReceiveResDiaryEmailMarketing": false,
        "ReceiveResDiarySmsMarketing": false,
        "ReceiveEmailMarketing": true,
        "ReceiveSmsMarketing": false,
        "MembershipId": "",
        "CustomField": null,
        "IsFavourite": false,
        "Company": "",
        "Birthday": "2026-02-02T00:00:00.0000000",
        "Postcode": "",
        "GroupEmailMarketingOptInText": "",
        "GroupSmsMarketingOptInText": "",
        "ResDiaryEmailMarketingOptInText": null,
        "ResDiarySmsMarketingOptInText": null,
        "ReceiveRestaurantEmailMarketing": false,
        "ReceiveRestaurantSmsMarketing": false,
        "RestaurantEmailMarketingOptInText": null,
        "RestaurantSmsMarketingOptInText": null,
        "CustomerType": null
        },
        "ConciergeId": null,
        "ConciergeEmail": null,
        "ConciergeCustomerId": null,
        "BookingReasonIds": [],
        "BookingStatus": "Booked",
        "BookingDateTime": "2026-02-02T14:59:20.9478118Z",
        "FunctionSheetUrl": null,
        "PreOrderUrl": null,
        "Token": "870B7B5FA317957B4818C1303F46273A",
        "PaymentInformation": {
        "IsCreditCardRequired": true,
        "IsPaymentRequired": false,
        "FormattedOutstandingAmount": "£0.00",
        "StripeOutstandingAmount": "0",
        "StripeOutstandingTotal": 0,
        "StripePublishableKey": "pk_live_6G2ASZKBTJJNEtJROnpmRSt6",
        "HasPageExpired": false,
        "HoursToExpiry": null,
        "MinutesToExpiry": null,
        "StripeAccountId": "acct_1HKKZxDaVcDfKE0O"
        },
        "CanEdit": true,
        "CanCancel": true,
        "IsCreditCardTokenStored": false,
        "DepositPaidAmount": 0,
        "AreaId": 143309,
        "HasEditCancellationWindowPassed": false,
        "RoomNumber": null,
        "GuestConfirmedByPhone": false,
        "IsEventBooking": false,
        "IsTakeawayBooking": false,
        "TakeawayType": "None",
        "DeliveryFee": 0,
        "PreorderId": null,
        "PreorderGuestFormUrl": null,
        "MenuVersionId": null,
        "Review": null,
        "Duration": 90,
        "VisitDateTimeUtc": "2026-02-08T14:00:00.0000000Z",
        "EditToken": "B9E948955CF563D756C29C5BAA91B1CB",
        "DishcultRewardsVoucherCode": null,
        "DishcultRewardsVoucherAmount": null,
        "DishcultRewardsVoucherIsValid": null
        },
        "Status": "PaymentFailed",
        "Errors": null,
        "PaymentAmount": 0,
        "StripePublishableKey": "pk_live_6G2ASZKBTJJNEtJROnpmRSt6",
        "FormattedPaymentAmount": "£0.00",
        "StripeAccountId": "acct_1HKKZxDaVcDfKE0O",
        "SetupIntentClientSecret": null,
        "PaymentIntentSecret": null,
        "StripeCheckoutSessionId": null,
        "DishcultRewardVoucherAttached": false
        }
      
      console.log('Making TopConfirm API call to:', `/api/ConsumerApi/v1/Restaurant/${getCurrentRestaurant(pubType, window.location.pathname)}/BookingWithStripeToken`);
      console.log('Current pathname:', window.location.pathname);
      console.log('Detected restaurant:', getCurrentRestaurant(pubType, window.location.pathname));
      
      // Check response status and handle accordingly
      const status = response.data.Status;
      setApiStatus(status);

      switch (status) {
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
        case 'PaymentFailed':
          // Booking exists but payment failed - show payment modal to retry
          if (response.data.Booking) {
            setBookingResponse(response.data);
            setPaymentStatus('PaymentRequired');
            setShowPaymentModal(true);
            setError(`Payment failed. Your booking reference is ${response.data.Booking.Reference}. Please complete payment below.`);
          } else {
            setError('Payment failed. Please try again.');
          }
          break;
        case 'CustomerBlocked':
          setError('We\'re sorry, but we\'re unable to process your booking at this time. Please contact us for assistance.');
          break;
        case 'Success':
          // Direct success - navigate to booked page
          clearAllBookingData();
          dispatch(resetBooking());
          dispatch(addSuccessBookingData(response.data));
          navigate('/topBooked');
          break;
        default:
          setError(`Status: ${status}. Please try again or contact us for assistance.`);
          console.error('Unexpected status:', status);
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
    clearAllBookingData();
    dispatch(resetBooking());
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

        {(error || apiStatus) && (
          <div className={styles.errorMessage}>
            {apiStatus && (
              <div style={{ color: '#856404', marginBottom: '0.5rem', fontWeight: '600' }}>
                Status: {apiStatus}
              </div>
            )}
            {error && (
              <div style={{ fontWeight: 'bold' }}>
                {error}
              </div>
            )}
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
              {specialRequests
                ? specialRequests.replace(/\s*\(Session ID: [^)]+\)/g, '')
                : "No Comment"}
            </div>
          </section>

          <div className={styles.tableReturnInfo}>
            On busy days we respectfully require your table back by {formatTimeTo12Hour(bookingState.returnBy) || "XX:XX"} but if you would like to stay longer and enjoy our beautiful pub then please let your server know and we will try to accommodate you somewhere for post meal drinks.
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
            label="Complete Booking"
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
