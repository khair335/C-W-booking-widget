import React, { useEffect } from "react";
import styles from "./LongHopHome.module.css";
import { Link } from "react-router-dom";
import sectionimage from "../../images/TheLongHop_MainiMAGE.jpg";
import tablebookingimg from "../../images/table_restaurant.png";
import modifyimg from "../../images/edit_calendar.png";
import cancelimg from "../../images/Menu Icon Mobile.png";
import tabimg from "../../images/Menu Icon Mobile (1).png";
import logo from "../../images/The Long Hop - text.png";
import alertimg from "../../images/alert-circle.png";
import { FiInfo } from "react-icons/fi";
import { Modal } from 'bootstrap';
import PubImageHeaderLongHop from '../../components/PubImageHeaderLongHop/PubImageHeaderLongHop';

function LongHopHome() {
  useEffect(() => {
    const removeBackdrop = () => {
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };

    return () => {
      removeBackdrop();
    };
  }, []);

  const handleModalClose = () => {
    const modal = document.getElementById('exampleModalToggle');
    if (modal) {
      const bsModal = Modal.getInstance(modal);
      if (bsModal) {
        bsModal.hide();
      }
    }
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  };

  return (
    <>
      <div className="homeMain" id="homepage">


        <PubImageHeaderLongHop
          sectionImg={sectionimage}
          pubLinkLabel="CHOOSE ANOTHER PUB"

          pubLink="/Select"
        />
        <div className="section bookingcontainer">
          <img className='logo' src={logo} alt="logo" />
          <div className="logo-large">Booking</div>
          <div className="titlehome">Plan, Modify, Or Cancel Your Reservation</div>
          <div
            className="bookingttype"
            data-bs-target="#exampleModalToggle"
            data-bs-toggle="modal"
          >
            <div className="book-text">
              <img src={tablebookingimg} alt="bookingtableimg" />
              Book A Table
            </div>
            <img src={tabimg} alt="tab-img" />
          </div>

          <div className="bookingttype">
            <Link to="/longhopModify" className="modifylink">
              <div className="book-text">
                <img src={modifyimg} alt="modify-image" />
                Modify A Booking
              </div>
              <img src={tabimg} alt="tab-img" />
            </Link>
          </div>

          <div className="bookingttype changeborder">
            <Link to="/longhopCancel" className="modifylink">
              <div className="book-text" id="cancelid">
                <img src={cancelimg} alt="cancel-img" />
                Cancel A Booking
              </div>
              <img src={tabimg} alt="tab-img" />
            </Link>
          </div>
          <Link to="/Select" className="anotherpub2">
            CHOOSE ANOTHER PUB
          </Link>
          <div>
            <Link href="#" className="Existlink">
              Exit and cancel Booking
            </Link>
          </div>
          {/* Modal */}
          <div
            className="modal fade"
            id="exampleModalToggle"
            tabIndex="-1"
            aria-labelledby="exampleModalToggleLabel"
            aria-hidden="true"
            data-bs-backdrop="static"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="exampleModalToggleLabel">
                    <FiInfo />

                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleModalClose}
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <h2 className="logo-large">Please Note:</h2>
                  <p>Our max table size is 10 people. </p>
                  <p>
                    Cat & Wickets pubs are
                    cashless — card or contactless payments only.</p>
                </div>
                <div className="modal-footer ">
                  <Link to="/select" className="btn btn-primary confirmbtn w-100" onClick={handleModalClose}>
                    CONFIRM
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Select */}
    </>
  );
}
export default LongHopHome;

