import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WebFont from 'webfontloader';

// Import pages
import Login from './pages/login'; 
import Dashboard from './pages/dashboard';
import Status from './pages/status';
import List from './pages/list';
import BeneficiaryList from './pages/listBeneficiaire';
import MembreList from './pages/membres';
import Partners from './pages/listPartenaires';
import Event from './pages/events';
import AllEvent from './pages/allEvents';
import Formation from './pages/Formation';
import FormationDetails from './pages/formation_details';
import Activiteprv from './pages/activite_prv';
import EventprvDetails from './pages/activitePriveDetails';
import EventDetails from './pages/eventDetails';
import ParticipantsList from './pages/volunteers';
import ParticipantsBenefList from './pages/beneficiary';
import Home from './pages/home';
import Signup from './pages/signup';
import SignupSuccess from './pages/signup_success';
import Newsletter from './pages/newsletter';
import History from './pages/HistoryEvents';
import Loginb from './pages/loginb';
import Dashboardv from './pages/dashboardv';
import Events from './pages/evenements';
import AllEvents from './pages/showAllEvent';
import DetailsEvent from './pages/showEventDetails';
import Formations from './pages/showAllFormation';
import FormationsD from './pages/showFormationDetails'
import EventAvenir from './pages/event-avenir';
import EventAvenirB from './pages/beneficiary/event-avenir';
import Profileb from './pages/beneficiary/profileb';
import Profilev from './pages/profilev';
import InfosUser from './pages/infosUser';
import DonsPages from './pages/dons';
import Candidat from './pages/candidat';
import Dashboardb from './pages/dashboardb';
import EventsForB from './pages/beneficiary/Evenements';
import AllEventsB from './pages/beneficiary/all-events';
import DetailsEventB from './pages/beneficiary/activity-details';
import UpdateProfileForm from './pages/beneficiary/UpdateProfileForm';
import UpdateAvailability from './pages/UpdateAvailabilityForm';
import Dons from './pages/dons';
import VolunteersF from './pages/volunteersF';
import Loginc from './pages/loginc';
import Dashboardc from './pages/partner/dashboardc';
import Profilec from './pages/partner/profile';
import ChangePasswordC from './pages/partner/changepassword';
import Supportc from './pages/partner/contactsupport';
import Documentsc from './pages/partner/documents';
import Support from './pages/beneficiary/Support';
import CalendarB from './pages/beneficiary/calendar';
import CalendarV from './pages/calendarV';
import MaraudeV from './pages/maraudeV';
import Maraude from './pages/maraude';
import Collecte from './pages/creation_circuit';


import './css/home.css';
import './css/signup.css';  
import './css/admin.css';
import './css/loginb.css';

// Import authentication wrapper
import ProtectedRoute from './pages/hooks/authToken';
import OneSignalManager from './components/OneSignalManager';

// Load web fonts
WebFont.load({
  google: {
    families: ['Inter:wght@400;700']
  }
});

function App() {
  return (
    
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signup_success" element={<SignupSuccess />} />
        <Route path="/loginb" element={<Loginb />} />
        <Route path="/loginc" element={<Loginc />} />
        <Route path="/" element={<Home />} />
        <Route path="/dons" element={<Dons />} />


        {/* Protected Routes for Admins */}
        <Route element={<ProtectedRoute userType="admin"/>}>
        <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/status" element={<Status />} />
            <Route path="/admin/list" element={<List />} />
            <Route path="/admin/collecte" element={<Collecte />} />
            <Route path="/admin/beneficiaires" element={<BeneficiaryList />} />
            <Route path="/admin/membres" element={<MembreList />} />
            <Route path="/admin/events" element={<Event />} />
            <Route path="/admin/maraude" element={<Maraude />} />
            <Route path="/admin/formations" element={<Formation />} />
            <Route path="/admin/volunteersF" element={<VolunteersF />} />
            <Route path="/admin/formations/:ID_Formation" element={<FormationDetails />} />
            <Route path="/admin/activites" element={<AllEvent />} />
            <Route path="/admin/activiteprv" element={<Activiteprv />} />
            <Route path="/admin/activity-details/:eventId" element={<EventDetails />} />
            <Route path="/admin/volunteers/:eventId" element={<ParticipantsList />} />
            <Route path="/admin/beneficiaires/:eventId" element={<ParticipantsBenefList />} />
            <Route path="/admin/activiteprv_details/:eventId" element={<EventprvDetails />} />
            <Route path="/admin/partners" element={<Partners />} />
            <Route path="/admin/newsletter" element={<Newsletter />} />
            <Route path="/admin/historyActivity" element={<History />} />
            <Route path="/admin/infosUser/:typePath/:email" element={<InfosUser />} />
        </Route>

        <Route element={<ProtectedRoute userType="volunteer"/>}>
          <Route path="/candidat" element={<Candidat />} />
          <Route path="/volunteer/dashboard" element={<Dashboardv />} />
          <Route path="/volunteer/calendar" element={<CalendarV />} />
          <Route path="/volunteer/profile" element={<Profilev />} />
          <Route path="/volunteer/maraude" element={<MaraudeV />} />
          <Route path="/volunteer/UpdateAvailability" element={<UpdateAvailability />} />
          <Route path="/volunteer/evenements" element={<Events />} />
          <Route path="/volunteer/all-events" element={<AllEvents />} />
          <Route path="/volunteer/activity-details/:eventId" element={<DetailsEvent />} />
          <Route path="/volunteer/activity-avenir/:id" element={<EventAvenir />} />
          <Route path="/volunteer/formations" element={<Formations />} />
          <Route path="/volunteer/formations/:ID_Formation" element={<FormationsD />} />

        </Route>
        <Route element={<ProtectedRoute userType="beneficiary"/>}>
             <Route path="/candidat" element={<Candidat />} />
             <Route path="/beneficiary/profile" element={<Profileb />} />
             <Route path="/beneficiary/calendar" element={<CalendarB />} />
             <Route path="/beneficiary/support" element={<Support />} />
             <Route path="/beneficiary/UpdateProfileFormb" element={<UpdateProfileForm />} />
             <Route path="/beneficiary/dashboard" element={<Dashboardb />} />
             <Route path="/beneficiary/evenements" element={<EventsForB />} />
            <Route path="/beneficiary/all-events" element={<AllEventsB />} />
            <Route path="/beneficiary/activity-details/:eventId" element={<DetailsEventB />} />
            <Route path="/beneficiary/activity-avenir/:id" element={<EventAvenirB />} />

        </Route>

        <Route element={<ProtectedRoute userType="partner"/>}>
        <Route path="/partner/dashboard" element={<Dashboardc />} />
        <Route path="/partner/documents" element={<Documentsc />} />
        <Route path="/partner/Profile" element={<Profilec />} />
        <Route path="/partner/modifypassword" element={<ChangePasswordC />} />
        <Route path="/partner/Support" element={<Supportc />} />
      
        </Route>


      </Routes>
    </Router>
  );
}

export default App;
