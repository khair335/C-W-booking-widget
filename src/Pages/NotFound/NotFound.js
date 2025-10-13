import React from "react";
import { Link } from "react-router-dom";
import styles from "./NotFound.module.css";
import tapandrunlogo from "../../images/Logo (1).png";
import griffinlogo from "../../images/Griffin Black.png";
import longhoplogo from "../../images/The Long Hop - text.png";

export default function NotFound() {
  return (
    <div className={styles.notFoundMain}>
      <div className={styles.notFoundContainer}>
        <div className={styles.errorCode}>404</div>
        <h1 className={styles.title}>Page Not Found</h1>
        <p className={styles.message}>
          Oops! The page you're looking for doesn't exist.
        </p>
        <p className={styles.subMessage}>
          Let's get you back on track. Choose your pub to make a booking:
        </p>

        <div className={styles.pubOptions}>
          <Link to="/topandrun" className={styles.pubCard}>
            <img src={tapandrunlogo} alt="Tap & Run" className={styles.pubLogo} />
            <h3 className={styles.pubName}>Tap & Run</h3>
            <p className={styles.pubAddress}>Upper Broughton, Melton Mowbray</p>
          </Link>

          <Link to="/griffin" className={styles.pubCard}>
            <img src={griffinlogo} alt="The Griffin Inn" className={styles.pubLogo} />
            <h3 className={styles.pubName}>The Griffin Inn</h3>
            <p className={styles.pubAddress}>Swithland, Leicester</p>
          </Link>

          <Link to="/longhop" className={styles.pubCard}>
            <img src={longhoplogo} alt="The Long Hop" className={styles.pubLogo} />
            <h3 className={styles.pubName}>The Long Hop</h3>
            <p className={styles.pubAddress}>Coming Soon</p>
          </Link>
        </div>

        <div className={styles.alternativeLinks}>
          <Link to="/select" className={styles.primaryLink}>
            Choose a Pub
          </Link>
          <Link to="/Modify" className={styles.secondaryLink}>
            Modify Existing Booking
          </Link>
          <Link to="/" className={styles.homeLink}>
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

