import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import StatsBar from './components/StatsBar';
import Features from './components/Features';
import CoursesSection from './components/CoursesSection';

import CTASection from './components/CTASection';

import Footer from './components/Footer';
import RegisterPage from './components/RegisterPage';
import LoginPage from './components/LoginPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import CatalogPage from './components/CatalogPage';
import StaticPage from './components/StaticPage';
import SettingsPage from './components/SettingsPage';
import AccountPage from './components/AccountPage';
import AdminPage from './components/AdminPage';
import TrainersPage from './components/TrainersPage';
import TrainerDetailPage from './components/TrainerDetailPage';
import TrainerEditPage from './components/TrainerEditPage';
import ProfilePage from './components/ProfilePage';
import EvaluationsPage from './components/EvaluationsPage';
import AboutPage from './components/AboutPage';
import JobsPage from './components/JobsPage';
import PersonalSkillsProgram from './components/PersonalSkillsProgram';
import FloatingAssistant from './components/FloatingAssistant';
import { useI18n } from './lib/i18n';
import ProjectMasterPage from './components/ProjectMasterPage';
import ProjectDetailsPage from './components/ProjectDetailsPage';
import ProjectDetailsViewPage from './app/pages/project-details-page/ProjectDetailsViewPage';
import ProgramDetailsPage from './components/ProgramDetailsPage';
import ProgramDetailsViewPage from './app/pages/program-details-page/ProgramDetailsViewPage';
import SessionsPage from './components/SessionsPage';
import StudentsPage from './components/StudentsPage';
import StudentDataEntryPage from './components/StudentDataEntryPage';
import StudentAttendancePage from './components/StudentAttendancePage';
import StudentEvaluationsPage from './components/StudentEvaluationsPage';
import TrainersCategoryPage from './components/TrainersCategoryPage';
import CertificatesPage from './components/CertificatesPage';
import ComplaintsPage from './app/pages/complaints-page/ComplaintsPage';
import SearchPage from './components/SearchPage';
import ProtectedRoute from './components/ProtectedRoute';
import VideoGalleryPage from './app/pages/video-gallery/VideoGalleryPage';
import VideoViewPage from './app/pages/video-gallery/VideoViewPage';
import ContentUploadPage from './app/pages/content-upload/ContentUploadPage';

function App() {
  const { t, lang } = useI18n();
  const isRtl = lang === 'ar';
  
  // Check admin access for admin route
  const checkAdminAccess = (path) => {
    if (path === '/admin') {
      try {
        const userData = localStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          const userEmail = user.email || user.Email || '';
          const userRole = user.role || user.Role || '';
          
          const isAdmin = userRole === 'SupportAgent' || userRole === 'Admin' || userRole === 'admin' || userEmail === 'yjmt469999@gmail.com';
          
          if (!isAdmin) {
            return false;
          }
          return true;
        } else {
          return false;
        }
      } catch (error) {
        console.error('Error checking admin access:', error);
        return false;
      }
    }
    return true;
  };

  return (
    <Router>
      <div className="min-h-screen bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={
              <>
                <Hero />
                <StatsBar />
                <Features />
                <CoursesSection />
                <CTASection />
              </>
            } />
            
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot" element={<ForgotPasswordPage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/admin" element={
              checkAdminAccess('/admin') ? <AdminPage /> : <Navigate to="/login" replace />
            } />
            <Route path="/trainers" element={
              <ProtectedRoute>
                <TrainersPage />
              </ProtectedRoute>
            } />
            <Route path="/trainers/edit" element={
              <ProtectedRoute>
                <TrainerEditPage />
              </ProtectedRoute>
            } />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/evaluations" element={
              <ProtectedRoute>
                <EvaluationsPage />
              </ProtectedRoute>
            } />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/personal-skills" element={<PersonalSkillsProgram />} />
            <Route path="/complaints" element={
              <ProtectedRoute>
                <ComplaintsPage />
              </ProtectedRoute>
            } />
            
            {/* Student pages */}
            <Route path="/students" element={
              <ProtectedRoute>
                <StudentsPage />
              </ProtectedRoute>
            } />
            <Route path="/students/data" element={
              <ProtectedRoute>
                <StudentDataEntryPage />
              </ProtectedRoute>
            } />
            <Route path="/students/attendance" element={
              <ProtectedRoute>
                <StudentAttendancePage />
              </ProtectedRoute>
            } />
            <Route path="/students/evaluations" element={
              <ProtectedRoute>
                <StudentEvaluationsPage />
              </ProtectedRoute>
            } />
            
            {/* Trainers category pages */}
            <Route path="/trainers/soft-skills" element={
              <ProtectedRoute>
                <TrainersCategoryPage />
              </ProtectedRoute>
            } />
            <Route path="/trainers/technical" element={
              <ProtectedRoute>
                <TrainersCategoryPage />
              </ProtectedRoute>
            } />
            <Route path="/trainers/freelancer" element={
              <ProtectedRoute>
                <TrainersCategoryPage />
              </ProtectedRoute>
            } />
            <Route path="/trainers/english" element={
              <ProtectedRoute>
                <TrainersCategoryPage />
              </ProtectedRoute>
            } />
            
            {/* Services */}
            <Route path="/certificates" element={<CertificatesPage />} />
            <Route path="/corporate-training" element={<StaticPage title={t('pages.corporate.title')}>{t('pages.corporate.content')}</StaticPage>} />
            <Route path="/edu-consulting" element={<StaticPage title={t('pages.consulting.title')}>{t('pages.consulting.content')}</StaticPage>} />
            <Route path="/scholarships" element={<StaticPage title={t('pages.scholarships.title')}>{t('pages.scholarships.content')}</StaticPage>} />
            <Route path="/support" element={<StaticPage title={t('pages.support.title')}>{t('pages.support.content')}</StaticPage>} />
            
            {/* Project/Program pages */}
            <Route path="/projects-master" element={
              <ProtectedRoute>
                <ProjectMasterPage />
              </ProtectedRoute>
            } />
            <Route path="/projects-master/edit/:projectId" element={
              <ProtectedRoute>
                <ProjectMasterPage />
              </ProtectedRoute>
            } />
            <Route path="/projects-details" element={
              <ProtectedRoute>
                <ProjectDetailsPage />
              </ProtectedRoute>
            } />
            <Route path="/project-details/:projectId" element={
              <ProtectedRoute>
                <ProjectDetailsViewPage />
              </ProtectedRoute>
            } />
            <Route path="/programs-details" element={
              <ProtectedRoute>
                <ProgramDetailsPage />
              </ProtectedRoute>
            } />
            <Route path="/program-details/:programId" element={
              <ProtectedRoute>
                <ProgramDetailsViewPage />
              </ProtectedRoute>
            } />
            <Route path="/sessions" element={
              <ProtectedRoute>
                <SessionsPage />
              </ProtectedRoute>
            } />
            <Route path="/videos" element={
              <ProtectedRoute>
                <VideoGalleryPage />
              </ProtectedRoute>
            } />
            <Route path="/videos/:id" element={
              <ProtectedRoute>
                <VideoViewPage />
              </ProtectedRoute>
            } />
            <Route path="/content-upload" element={
              <ProtectedRoute>
                <ContentUploadPage />
              </ProtectedRoute>
            } />
            
            {/* Search page */}
            <Route path="/search" element={<SearchPage />} />
            
            {/* Trainer detail route */}
            <Route path="/trainer/:trainerId" element={
              <ProtectedRoute>
                <TrainerDetailPage />
              </ProtectedRoute>
            } />
            
            {/* Catch all route */}
            <Route path="*" element={
              <>
                <Hero />
                <StatsBar />
                <Features />
                <CoursesSection />
                <CTASection />
              </>
            } />
          </Routes>
        </main>
        <Footer />
        <FloatingAssistant />
      </div>
    </Router>
  );
}

export default App;
