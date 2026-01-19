import React, { useState, useEffect } from "react";
import { putRequest } from "../../config/AxiosRoutes/index"
import logo from "../../images/T&R Black.png";
import dateicon from "../../images/Chips Icons Mobile.png";
import timeicon from "../../images/Chips Icons Mobile (1).png";
import membericon from "../../images/Chips Icons Mobile (3).png";
import resturanticon from "../../images/table_restaurant.png";
import whitelogo from "../../images/T&R White.png"
import sectionimg2 from "../../images/Tap & Run_MainImage 1.png";
import styles from "./TopConfirmed.module.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { updateBasicInfo, updateSpecialRequests } from '../../store/bookingSlice';
import PubImageHeader from '../../components/PubImageHeader/PubImageHeader';
import InfoChip from '../../components/InfoChip/InfoChip';
import CustomCheckbox from '../../components/ui/CustomCheckbox/CustomCheckbox';
import CustomTextarea from '../../components/ui/CustomTextarea/CustomTextarea';
import CustomButton from '../../components/ui/CustomButton/CustomButton';
import Indicator from '../../components/Indicator/Indicator';
import PrivacyPolicyModal from '../../components/PrivacyPolicyModal';

export default function TopConfirmed() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get state from Redux
  const bookingState = useSelector((state) => state.booking);
  const { date, time, adults, children, selectedPromotion, customerDetails, specialRequests, successBookingData
  } = bookingState;

  // Get submission data from location state
  const submissionData = location.state || {};

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPrivacyPolicyModal, setShowPrivacyPolicyModal] = useState(false);
  const [comment, setComment] = useState((() => {
    console.log('🔍 TopConfirmed - Initializing comment');
    console.log('🔍 specialRequests:', specialRequests);
    console.log('🔍 specialRequests type:', typeof specialRequests);
    console.log('🔍 specialRequests length:', specialRequests ? specialRequests.length : 'null/undefined');

    if (!specialRequests) {
      console.log('🔍 No specialRequests, returning empty string');
      return "";
    }

    if (!specialRequests.includes('Pre-ordered:')) {
      console.log('🔍 No Pre-ordered content found');
      // Hide Session IDs from comments that don't have Pre-ordered content
      const result = specialRequests.replace(/\s*\(Session ID: [^)]+\)/g, '');
      console.log('🔍 After Session ID removal (no Pre-ordered):', result);
      return result;
    }

    console.log('🔍 Contains Pre-ordered content');

    // Check if it has the separator format
    if (specialRequests.includes(' - Pre-ordered:')) {
      console.log('🔍 Has separator format');
      const commentPart = specialRequests.split(' - Pre-ordered:')[0].trim();
      console.log('🔍 Comment part before Session ID removal:', commentPart);
      // Hide Session IDs from the comment part
      const result = commentPart.replace(/\s*\(Session ID: [^)]+\)/g, '');
      console.log('🔍 Comment part after Session ID removal:', result);
      return result;
    } else if (specialRequests.startsWith('Pre-ordered:')) {
      console.log('🔍 Only Pre-ordered content, showing drink info without Session ID');
      // Extract drink info but hide Session ID
      const drinkPart = specialRequests.substring('Pre-ordered:'.length).trim();
      const result = drinkPart.replace(/\s*\(Session ID: [^)]+\)/g, '');
      console.log('🔍 Drink info after Session ID removal:', result);
      return result;
    }

    console.log('🔍 Fallback case');
    // Hide Session IDs from any remaining specialRequests content
    const result = specialRequests.replace(/\s*\(Session ID: [^)]+\)/g, '');
    console.log('🔍 Fallback after Session ID removal:', result);
    return result;
  })());

  // Try to restore missing data from localStorage if Redux state is incomplete
  useEffect(() => {
    const hasBasicData = date && time && (adults !== undefined) && (children !== undefined);

    if (!hasBasicData) {
      console.log('Top Confirmed page - Missing basic data, attempting to restore from localStorage');

      try {
        const pendingBookingData = localStorage.getItem('pendingBookingData');
        if (pendingBookingData) {
          const bookingData = JSON.parse(pendingBookingData);
          console.log('Restoring data from localStorage:', bookingData);

          // Restore basic booking info if missing
          if (!date || !time || adults === undefined || children === undefined) {
            dispatch(updateBasicInfo({
              date: bookingData.date || date,
              time: bookingData.time || time,
              adults: bookingData.adults !== undefined ? bookingData.adults : adults,
              children: bookingData.children !== undefined ? bookingData.children : children,
              pubType: bookingData.pubType || bookingData.restaurant
            }));
          }
        }
      } catch (error) {
        console.error('Error restoring data from localStorage:', error);
      }
    }
  }, [date, time, adults, children, dispatch]);


  // Sync comment state with Redux specialRequests (hide Session IDs)
  useEffect(() => {
    console.log('🔄 TopConfirmed - useEffect syncing comment with specialRequests');
    console.log('🔄 specialRequests:', specialRequests);

    if (!specialRequests) {
      console.log('🔄 No specialRequests, setting comment to empty');
      setComment("");
      return;
    }

    if (!specialRequests.includes('Pre-ordered:')) {
      console.log('🔄 No Pre-ordered, hiding Session IDs from comment');
      // Hide Session IDs from comments that don't have Pre-ordered content
      const cleaned = specialRequests.replace(/\s*\(Session ID: [^)]+\)/g, '');
      console.log('🔄 Comment after Session ID removal:', cleaned);
      setComment(cleaned);
      return;
    }

    console.log('🔄 Contains Pre-ordered content');

    // Check if it has the separator format
    if (specialRequests.includes(' - Pre-ordered:')) {
      console.log('🔄 Has separator format');
      const commentPart = specialRequests.split(' - Pre-ordered:')[0].trim();
      console.log('🔄 Comment part before cleaning:', commentPart);
      // Hide Session IDs from the comment part
      const cleaned = commentPart.replace(/\s*\(Session ID: [^)]+\)/g, '');
      console.log('🔄 Comment part after cleaning:', cleaned);
      setComment(cleaned);
    } else if (specialRequests.startsWith('Pre-ordered:')) {
      console.log('🔄 Only Pre-ordered content, showing drink info without Session ID');
      // Extract drink info but hide Session ID
      const drinkPart = specialRequests.substring('Pre-ordered:'.length).trim();
      const cleaned = drinkPart.replace(/\s*\(Session ID: [^)]+\)/g, '');
      console.log('🔄 Drink info after Session ID removal:', cleaned);
      setComment(cleaned);
    } else {
      console.log('🔄 Fallback case, hiding Session IDs');
      // Hide Session IDs from any remaining specialRequests content
      const cleaned = specialRequests.replace(/\s*\(Session ID: [^)]+\)/g, '');
      console.log('🔄 Fallback comment after cleaning:', cleaned);
      setComment(cleaned);
    }
  }, [specialRequests]);

  const handleCommentChange = (e) => {
    const newComment = e.target.value;
    setComment(newComment);

    // Update specialRequests by replacing the comment part or adding it
    let updatedSpecialRequests = newComment;

    if (specialRequests && specialRequests.includes('Pre-ordered:')) {
      // Extract the drink part
      let drinkPart = '';
      if (specialRequests.includes(' - Pre-ordered:')) {
        drinkPart = specialRequests.split(' - Pre-ordered:')[1];
        if (newComment.trim()) {
          updatedSpecialRequests = `${newComment} - Pre-ordered:${drinkPart}`;
        } else {
          updatedSpecialRequests = `Pre-ordered:${drinkPart}`;
        }
      } else if (specialRequests.startsWith('Pre-ordered:')) {
        drinkPart = specialRequests;
        if (newComment.trim()) {
          updatedSpecialRequests = `${newComment} - ${drinkPart}`;
        } else {
          updatedSpecialRequests = drinkPart;
        }
      }
    }

    dispatch(updateSpecialRequests(updatedSpecialRequests));
  };

  const handleBooking = async () => {
    setIsSubmitting(true);
    setError('');
    const token = localStorage.getItem('token');

    if (!token) {
      setError('Authentication token not found');
      setIsSubmitting(false);
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    };

    const toUrlEncoded = (obj, prefix) => {
      const str = [];
      for (const p in obj) {
        if (obj.hasOwnProperty(p)) {
          const key = prefix ? `${prefix}[${p}]` : p;
          const value = obj[p];
          if (value === null || value === undefined) {
            continue; // Skip null or undefined values
          }
          if (typeof value === 'object' && value !== null) {
            str.push(toUrlEncoded(value, key));
          } else {
            // Convert boolean values to strings
            const stringValue = typeof value === 'boolean' ? value.toString() : value;
            str.push(encodeURIComponent(key) + '=' + encodeURIComponent(stringValue));
          }
        }
      }
      return str.join('&');
    };

    // Create the booking data object with only required fields
    const bookingData = {
      VisitDate: date,
      VisitTime: time,
      PartySize: parseInt(adults) + parseInt(children || 0),
      PromotionId: selectedPromotion?.Id || '',
      PromotionName: selectedPromotion?.Name || '',
      Customer: {
        FirstName: customerDetails.FirstName || '',
        Surname: customerDetails.Surname || '',
        MobileCountryCode: customerDetails.MobileCountryCode || '+44',
        Mobile: customerDetails.Mobile || '',
        Email: customerDetails.Email || '',
        ReceiveEmailMarketing: customerDetails.ReceiveEmailMarketing || false,
        ReceiveSmsMarketing: customerDetails.ReceiveSmsMarketing || false,
        ReceiveRestaurantEmailMarketing: customerDetails.ReceiveRestaurantEmailMarketing || false,
        ReceiveRestaurantSmsMarketing: customerDetails.ReceiveRestaurantSmsMarketing || false,
        Birthday: customerDetails.Birthday || ''
      },
      SpecialRequests: specialRequests || '',
      ChannelCode: 'ONLINE',
      IsLeaveTimeConfirmed: true
    };

    try {
      const encodedData = toUrlEncoded(bookingData);
      console.log('Encoded booking data:', encodedData); // For debugging

      const response = await putRequest(
        `/api/ConsumerApi/v1/Restaurant/TheTapRun/Booking/${successBookingData.reference}`,
        headers,
        encodedData
      );

      if (response.data) {
        console.log('Booking Updated Success:', response.data);
        navigate('/TopUpdate');
      } else {
        throw new Error('No data received from server');
      }
    } catch (error) {
      console.error('Booking Failed:', error);
      setError(error.response?.data?.message || 'Failed to submit booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className={styles.ConfirmMain} id="choose">

      <PubImageHeader
        // pubLogo={logo}
        sectionImg={sectionimg2}
        pubLinkLabel="CHOOSE ANOTHER PUB"
        step={4}
        stepLength={4}
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
          <InfoChip
            icon={membericon}
            label={(parseInt(adults || 0) + parseInt(children || 0)) || "Select Party Size"}
            alt="member_icon"
          />
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
              <CustomTextarea
                label=""
                value={comment}
                onChange={handleCommentChange}
                placeholder="Add any special requests or comments"
                rows={3}
                minRows={3}
                maxRows={5}
              />
            </div>
            {specialRequests && specialRequests.includes('Pre-ordered:') && (() => {
              console.log('🍺 Top Confirmed page - DRINK SECTION');
              console.log('🍺 specialRequests:', specialRequests);

              // Extract drink info from the Pre-ordered section
              let preOrderedPart;
              if (specialRequests.includes(' - Pre-ordered:')) {
                console.log('🍺 Has separator format, extracting after separator');
                // Format: "Includes X children - Pre-ordered: ..."
                preOrderedPart = specialRequests.split(' - Pre-ordered:')[1];
              } else if (specialRequests.startsWith('Pre-ordered:')) {
                console.log('🍺 Starts with Pre-ordered, extracting after prefix');
                // Format: "Pre-ordered: ..." (drink info only)
                preOrderedPart = specialRequests.substring('Pre-ordered:'.length).trim();
              }
              console.log('🍺 preOrderedPart:', preOrderedPart);
              console.log('🍺 preOrderedPart type:', typeof preOrderedPart);
              console.log('🍺 preOrderedPart length:', preOrderedPart ? preOrderedPart.length : 'null/undefined');

              if (preOrderedPart) {
                console.log('🍺 preOrderedPart exists, processing drink info');

                // First, remove Session ID from the display
                console.log('🍺 Original preOrderedPart:', preOrderedPart);
                const cleanPreOrderedPart = preOrderedPart.replace(/\s*\(Session ID: [^)]+\)/g, '').trim();
                console.log('🍺 cleanPreOrderedPart after Session ID removal:', cleanPreOrderedPart);

                // Extract drink name and price from the cleaned string
                const drinkMatch = cleanPreOrderedPart.match(/^(.+?)\s*-\s*([^\s]+)$/);
                console.log('🍺 drinkMatch regex result:', drinkMatch);

                if (drinkMatch) {
                  const [, drinkName, drinkPrice] = drinkMatch;
                  console.log('🍺 Successfully parsed - Name:', drinkName, 'Price:', drinkPrice);

                  // Extract session ID for cancel functionality (from original preOrderedPart)
                  const sessionIdMatch = preOrderedPart.match(/Session ID:\s*([^)]+)/);
                  const sessionId = sessionIdMatch ? sessionIdMatch[1] : '';
                  console.log('🍺 Extracted sessionId for cancel:', sessionId);
                  console.log('🍺 sessionId exists:', !!sessionId);

                  return (
                    <div className={styles.drinkOrderSection}>
                      <h5 className={styles.drinkOrderTitle}>Pre-ordered Drink</h5>
                      <div className={styles.drinkOrderInfo}>
                        <div className={styles.drinkName}>{drinkName.trim()}</div>
                        <div className={styles.drinkPrice}>{drinkPrice}</div>
                        <button
                          className={styles.cancelDrinkBtn}
                          onClick={() => {
                            // Save current booking data before navigating to cancel page
                            const currentBookingData = {
                              date, time, adults, children, selectedPromotion, customerDetails, specialRequests, successBookingData
                            };
                            localStorage.setItem('bookingDataBeforeCancel', JSON.stringify(currentBookingData));

                            // Navigate to cancel page with session ID and source
                            navigate(`/cancel-pre-order-drink?session_id=${sessionId}&source=topconfirmed`);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  );
                } else {
                  console.log('🍺 drinkMatch failed - drink section will not render');
                  console.log('🍺 cleanPreOrderedPart that failed:', cleanPreOrderedPart);
                }
              } else {
                console.log('🍺 preOrderedPart is falsy - drink section will not render');
              }
              return null;
            })()}
          </section>

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
            labelStyle={styles.confirmCheckboxLabel}
          />
        </div>
        <div className={`${styles.Data_type} ${styles.ConfirmbtonMain}`}>
          <CustomButton
            label={isSubmitting ? "Booking..." : "Confirm changes"}
            onClick={handleBooking}
            disabled={isSubmitting}
          />
          <CustomButton
            label="Back"
            to="/topPickArea"
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

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={showPrivacyPolicyModal}
        onClose={() => setShowPrivacyPolicyModal(false)}
        pageType="top"
      />
    </div>
  );
}
