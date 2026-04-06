import React from "react";
import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";
import Home from '../../Pages/home/Home'
import Griffin from '../../Pages/griffin/griffin'
import LongHop from '../../Pages/longhop/LongHop'
import LongHopArea from '../../Pages/longhopArea/LongHopArea'
import LongHopDetails from '../../Pages/longhopDetails/LongHopDetails'
import LongHopConfirm from '../../Pages/longhopConfirm/LongHopConfirm'
import LongHopBooked from '../../Pages/longhopBooked/LongHopBooked'
import LongHopModify from '../../Pages/longhopModify/LongHopModify'
import LongHopEdit from '../../Pages/longhopEdit/LongHopEdit'
import LongHopPickArea from '../../Pages/longhopPickArea/LongHopPickArea'
import LongHopReDetail from '../../Pages/longhopReDetail/LongHopReDetail'
import LongHopConfirmed from '../../Pages/longhopConfirmed/LongHopConfirmed'
import LongHopUpdated from '../../Pages/longhopUpdated/LongHopUpdated'
import LongHopCancel from '../../Pages/longhopCancel/LongHopCancel'
import LongHopBookingNumber from '../../Pages/longhopBookingNumber/LongHopBookingNumber'
import LongHopLost from '../../Pages/longhopLost/LongHopLost'
import LongHopResent from '../../Pages/longhopResent/LongHopResent'
import LongHopCancelled from '../../Pages/longhopCancelled/LongHopCancelled'
import LongHopHome from '../../Pages/longhopHome/LongHopHome'
import NotFound from '../../Pages/NotFound/NotFound'
import Select from "../../Pages/select/Select";
import TopandRun from '../../Pages/topandrun/Top'
import Area from "../../Pages/Area/Area";
import Details from "../../Pages/Details/Details";
import Confirm from "../../Pages/confirm/Confirm";
import Booked from "../../Pages/booked/Booked";
import Modify from "../../Pages/Modify/Modify";
import Edit from "../../Pages/edit/Edit";
import PickArea from "../../Pages/PickArea/PickArea";
import ReDetail from "../../Pages/reDetail/ReDetail";
import Confirmed from "../../Pages/confrimed/Confirmed";
import Updated from "../../Pages/updated/Updated";
import Cancel from "../../Pages/cancel/Cancel";
import BookingNumber from "../../Pages/bookingNumber/BookingN";
import Lost from "../../Pages/lost/Lost";
import Resent from "../../Pages/reSent/ReSent";
import Cancelled from "../../Pages/cancelled/cancelled";
import TopArea from "../../Pages/TopArea/TopArea"
import TopDetails from "../../Pages/topDetails/TopDetail"
import TopConfirm from "../../Pages/topConfirm/TopConfirm"
import TopBooked from "../../Pages/topBooked/TopBooked"
import TopHome from "../../Pages/topHome/TopHome";
import TopModify from "../../Pages/topModify/TopModify"
import TopEdit from "../../Pages/topEdit/TopEdit";
import TopPickArea from "../../Pages/topPickArea/TopPickArea";
import TopReDetail from "../../Pages/topReDetaill/TopReDetail";
import TopConfirmed from "../../Pages/TopConfrimed/TopConfirmed";
import TopUpdate from "../../Pages/topUpdate/TopUpdate";
import TopCancel from "../../Pages/topCancel/TopCancel";
import TopBookingNumber from "../../Pages/topBookingNumber/TopBookingNumber";
import TopLost from "../../Pages/TopLost/TopLost";
import TopResent from "../../Pages/topResent/TopResent";
import TopCancelled from "../../Pages/TopCancelled/TopCancelled"
import PaymentSuccess from '../../Pages/PaymentSuccess/PaymentSuccess';
import PaymentCancelled from '../../Pages/PaymentCancelled/PaymentCancelled';
import CancelPreOrderDrink from '../../Pages/CancelPreOrderDrink/CancelPreOrderDrink';
let Router = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<TopandRun />} />
                <Route path="/griffin" element={<Griffin/>} />
                <Route path="/longhop" element={<LongHop />} />
                <Route path="/longhoparea" element={<LongHopArea />} />
                <Route path="/longhopdetails" element={<LongHopDetails />} />
                <Route path="/longhopconfirm" element={<LongHopConfirm />} />
                <Route path="/longhopbooked" element={<LongHopBooked />} />
                <Route path="/longhopModify" element={<LongHopModify />} />
                <Route path="/longhopEdit" element={<LongHopEdit />} />
                <Route path="/longhopPickArea" element={<LongHopPickArea />} />
                <Route path="/longhopReDetail" element={<LongHopReDetail />} />
                <Route path="/longhopConfirmed" element={<LongHopConfirmed />} />
                <Route path="/longhopUpdated" element={<LongHopUpdated />} />
                <Route path="/longhopCancel" element={<LongHopCancel />} />
                <Route path="/longhopBookingNumber" element={<LongHopBookingNumber />} />
                <Route path="/longhopLost" element={<LongHopLost />} />
                <Route path="/longhopResent" element={<LongHopResent />} />
                <Route path="/longhopCancelled" element={<LongHopCancelled />} />
                <Route path="/longhopHome" element={<LongHopHome />} />
                <Route path="/select" element={<Select />} />
                <Route path="/topandrun" element={<TopandRun />} />
                <Route path="/area" element={<Area />} />
                <Route path="/Details" element={<Details />} />
                <Route path="/Confirm" element={<Confirm />} />
                <Route path="/Booked" element={<Booked />} />
                <Route path="/Modify" element={<Modify />} />
                <Route path="/Edit" element={<Edit />} />
                <Route path="/PickArea" element={<PickArea />} />
                <Route path="/ReDetail" element={<ReDetail />} />
                <Route path="/Confirmed" element={<Confirmed />} />
                <Route path="/Updated" element={<Updated />} />
                <Route path="/Cancel" element={<Cancel />} />
                <Route path="/BookingNumber" element={<BookingNumber />} />
                <Route path="/Lost" element={<Lost />} />
                <Route path="/Resent" element={<Resent />} />
                <Route path="/Cancelled" element={<Cancelled />} />
                <Route path="/TopArea" element={<TopArea />} />
                <Route path="/TopDetails" element={<TopDetails />} />
                <Route path="/TopConfirm" element={<TopConfirm />} />
                <Route path="/TopBooked" element={<TopBooked />} />
                <Route path="/TopHome" element={<TopHome />} />
                <Route path="/TopModify" element={<TopModify />} />
                <Route path="/TopEdit" element={<TopEdit />} />
                <Route path="/TopPickArea" element={<TopPickArea />} />
                <Route path="/TopReDetail" element={<TopReDetail />} />
                <Route path="/TopConfirmed" element={<TopConfirmed />} />
                <Route path="/TopUpdate" element={<TopUpdate />} />
                <Route path="/TopCancel" element={<TopCancel />} />
                <Route path="/TopBookingNumber" element={<TopBookingNumber />} />
                <Route path="/TopLost" element={<TopLost />} />
                <Route path="/TopResent" element={<TopResent />} />
                <Route path="/TopCancelled" element={<TopCancelled />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/payment-cancelled" element={<PaymentCancelled />} />
                <Route path="/cancel-pre-order-drink" element={<CancelPreOrderDrink />} />
                {/* 404 - Catch all unmatched routes */}
                <Route path="*" element={<NotFound />} />

            </Routes>
        </BrowserRouter>
    )
}
export default Router