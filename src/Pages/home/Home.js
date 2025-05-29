import React, { useEffect } from "react";
import "./Home.css";
import { Link } from "react-router-dom";
import sectionimage from "../../images/79205c0e916b529d8d136ce69e32e592.png";
import tablebookingimg from "../../images/table_restaurant.png";
import modifyimg from "../../images/edit_calendar.png";
import cancelimg from "../../images/Menu Icon Mobile.png";
import tabimg from "../../images/Menu Icon Mobile (1).png";
import logo from "../../images/T&R Black.png";
import alertimg from "../../images/alert-circle.png";
import { FiInfo } from "react-icons/fi";
import { Modal } from 'bootstrap';

function Home() {
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
        <div className="section imagesect">
          <img
            src={sectionimage}
            alt="section_image"
            className="section_image"
          />
          <Link to="/TopHome" className="anotherpub">CHOOSE ANOTHER PUB</Link>
        </div>
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
              <Link to="/Modify" className="modifylink">
            <div className="book-text">
              <img src={modifyimg} alt="modify-image" />
                Modify A Booking
            </div>
            <img src={tabimg} alt="tab-img" />
              </Link>
          </div>

          <div className="bookingttype changeborder">
          <Link to="/Cancel" className="modifylink">
            <div className="book-text" id="cancelid">
              <img src={cancelimg} alt="cancel-img" />
              Cancel A Booking
            </div>
            <img src={tabimg} alt="tab-img" />
            </Link>
          </div>
          <Link to="/TopHome" className="anotherpub2">
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
                  <Link to="/Select" className="btn btn-primary confirmbtn w-100" onClick={handleModalClose}>
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
export default Home;
