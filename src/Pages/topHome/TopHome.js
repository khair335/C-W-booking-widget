import React from "react";
import "./TopHome.css";
import { Link, useNavigate } from "react-router-dom";
import * as bootstrap from 'bootstrap';
import sectionimage from "../../images/79205c0e916b529d8d136ce69e32e592.png";
import tablebookingimg from "../../images/table_restaurant.png";
import modifyimg from "../../images/edit_calendar.png";
import cancelimg from "../../images/Menu Icon Mobile.png";
import tabimg from "../../images/Menu Icon Mobile (1).png";
import logo from "../../images/Griffin Black.png";
import alertimg from "../../images/alert-circle.png";
import logo1 from "../../images/Logo (1).png";
import sectionimg2 from "../../images/Tap & Run_MainImage 1.png";
import whitelogo from "../../images/T&R White.png"
import PubImageHeader from '../../components/PubImageHeader/PubImageHeader';

function TopHome() {
  const navigate = useNavigate();

  const handleConfirmClick = (e) => {
    e.preventDefault();
    const modal = document.getElementById('exampleModalToggle');
    const modalInstance = bootstrap.Modal.getInstance(modal);
    if (modalInstance) {
      modalInstance.hide();
    }

    // Clean up all modal-related elements and classes
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';

    // Remove any remaining fade classes
    modal.classList.remove('show');
    modal.style.display = 'none';

    navigate('/topandrun');
  };

  return (
    <>
      <div className="homeMain" id="homepage">

        <PubImageHeader
          sectionImg={sectionimg2}
          pubLinkLabel="CHOOSE ANOTHER PUB"

          pubLink="/Select"
        />
        <div className="section bookingcontainer">
          <img className="confirm_logo" src={logo1} alt="logo" />
          <div className="logo-large">Booking</div>
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
              <Link to="/TopModify" className="modifylink">
            <div className="book-text">
              <img src={modifyimg} alt="modify-image" />
                Modify A Booking
            </div>
            <img src={tabimg} alt="tab-img" />
              </Link>
          </div>

          <div className="bookingttype changeborder">
          <Link to="/TopCancel" className="modifylink">
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
                    <img src={alertimg} alt="alert_img" />
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <h2 className="logo-large">Please Note:</h2>
                  <p>Our max table size is 10 people. Cat & Wickets pubs are
                  cashless — card or contactless payments only.</p>
                </div>
                <div className="modal-footer">
                  <button
                    onClick={handleConfirmClick}
                    className="btn btn-primary confirmbtn w-100"
                  >
                    CONFIRM
                  </button>
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
export default TopHome;
