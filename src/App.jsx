import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import * as Tone from 'tone';

// Hooks & Contexts
import { useAuth } from './hooks/useAuth';
import { useMusic } from './hooks/useMusic';
import { useLessons } from './hooks/useLessons';
import { useUserStats } from './hooks/useUserStats';
import { useRecording } from './hooks/useRecording';
import { useCollections } from './hooks/useCollections';

// Layouts & Pages
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import FeedPage from './pages/FeedPage';
import DiscoveryPage from './pages/DiscoveryPage';
import LearningPathsPage from './pages/LearningPathsPage';
import LearningPathPage from './pages/LearningPathPage';
import LearningPathBuilder from './pages/LearningPathBuilder';
import LessonPage from './pages/LessonPage';
import LibraryPage from './pages/LibraryPage';
import ReviewCenter from './pages/ReviewCenter';
import LandingPage from './components/LandingPage';
import LoginScreen from './components/LoginScreen';

// Modals & Components
import UnifiedLessonEditor from './modules/UnifiedLessonEditor';
import BluesMasterModal from './modules/bluesmastermodal';
import PianoMasterModal from './modules/pianomastermodal';
import GuitarMasterModal from './modules/guitarmastermodal';
import UkeleleMasterModal from './modules/ukelelemastermodal';
import UserProfileModal from './modules/userprofilemodal';
import ProMetronomeModal from './components/ProMetronomeModal';
import TunerModal from './components/TunerModal';
import GuitarTunerModal from './components/GuitarTunerModal';
import MidiSettingsModal from './components/midi/MidiSettingsModal';
import HelpTutorialModal from './components/HelpTutorialModal';
import InteractiveTour from './components/InteractiveTour';
import GlobalMidiSound from './components/midi/GlobalMidiSound';

// Utils
import { CATEGORIES, NOTES, ROUTINE_STEPS } from './utils/constants';
import { calculateHarp } from './utils/harmonica';

export default function App() {
    const { user, loading: authLoading, login, googleLogin, logout } = useAuth();
    const { bpm, setBpm, isMetroOn, setIsMetroOn, metroSettings, setMetroSettings } = useMusic();
    const { items, loading: lessonsLoading, addItem, updateItem, deleteItem } = useLessons(user);
    const { stats, achievements, addPoints, unlockAchievement } = useUserStats(user);
    const { isRecording, recordings, toggleRecording } = useRecording();
    const { collections, refreshCollections } = useCollections(user);
    const navigate = useNavigate();

    console.log("App State:", { user: !!user, authLoading });

    // UI States
    const [showLanding, setShowLanding] = useState(true);
    const [filter, setFilter] = useState('all');
    const [filterKey, setFilterKey] = useState('ALL');
    const [selectedItem, setSelectedItem] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    
    // Modals
    const [isBluesMasterOpen, setIsBluesMasterOpen] = useState(false);
    const [isPianoMasterOpen, setIsPianoMasterOpen] = useState(false);
    const [isGuitarMasterOpen, setIsGuitarMasterOpen] = useState(false);
    const [isUkeleleMasterOpen, setIsUkeleleMasterOpen] = useState(false);
    const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
    const [isProMetroOpen, setIsProMetroOpen] = useState(false);
    const [isMidiSettingsOpen, setIsMidiSettingsOpen] = useState(false);
    const [isTunerOpen, setIsTunerOpen] = useState(false);
    const [isGuitarTunerOpen, setIsGuitarTunerOpen] = useState(false);
    const [isTutorialOpen, setIsTutorialOpen] = useState(false);
    const [isTourOpen, setIsTourOpen] = useState(false);
    const [isRoutineOpen, setIsRoutineOpen] = useState(false);
    const [isTabEditorOpen, setIsTabEditorOpen] = useState(false);
    const [isKeyToolOpen, setIsKeyToolOpen] = useState(false);
    const [isBluesDegreeOpen, setIsBluesDegreeOpen] = useState(false);
    
    // Tour & Routine
    const [tourSteps, setTourSteps] = useState([]);



    if (authLoading) return (
        <div className="h-screen bg-slate-950 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (!user) {
        if (showLanding) return <LandingPage onEnter={async () => {
            await Tone.start();
            setShowLanding(false);
        }} />;
        return (
            <LoginScreen 
                onLogin={login} 
                onGoogleLogin={googleLogin}
                loading={authLoading} 
                onBack={() => setShowLanding(true)} 
            />
        );
    }

    return (
        <MainLayout
            setIsProMetroOpen={setIsProMetroOpen}
            setIsAdding={setIsAdding}
            setIsTourOpen={setIsTourOpen}
            setTourSteps={setTourSteps}
            MAIN_TOUR={[]} // Fill with actual tour steps
            stats={stats}
            filter={filter}
            setFilter={setFilter}
            filterKey={filterKey}
            setFilterKey={setFilterKey}
            setIsRoutineOpen={setIsRoutineOpen}
            setIsTabEditorOpen={setIsTabEditorOpen}
            setIsKeyToolOpen={setIsKeyToolOpen}
            setIsTunerOpen={setIsTunerOpen}
            setIsGuitarTunerOpen={setIsGuitarTunerOpen}
            setIsBluesDegreeOpen={setIsBluesDegreeOpen}
            setIsTutorialOpen={setIsTutorialOpen}
            setIsBluesMasterOpen={setIsBluesMasterOpen}
            setIsGuitarMasterOpen={setIsGuitarMasterOpen}
            setIsPianoMasterOpen={setIsPianoMasterOpen}
            setIsUkeleleMasterOpen={setIsUkeleleMasterOpen}
            setIsMidiSettingsOpen={setIsMidiSettingsOpen}
        >
            <Routes>
                <Route path="/library" element={<LibraryPage />} />
                <Route path="/profile/:username" element={<ProfilePage />} />
                <Route path="/discovery" element={<DiscoveryPage />} />
                <Route path="/learning-paths" element={<LearningPathsPage />} />
                <Route path="/path/:id" element={<LearningPathPage />} />
                <Route path="/path-builder" element={<LearningPathBuilder />} />
                <Route path="/path-builder/:id" element={<LearningPathBuilder />} />
                <Route path="/" element={
                    <FeedPage 
                        setIsBluesMasterOpen={setIsBluesMasterOpen}
                        setIsPianoMasterOpen={setIsPianoMasterOpen}
                        setIsGuitarMasterOpen={setIsGuitarMasterOpen}
                        setIsUkeleleMasterOpen={setIsUkeleleMasterOpen}
                    />
                } />
                <Route path="/review-center" element={<ReviewCenter />} />
                <Route path="/lesson/:id" element={
                    <LessonPage 
                        setIsBluesMasterOpen={setIsBluesMasterOpen}
                        setIsPianoMasterOpen={setIsPianoMasterOpen}
                        setIsGuitarMasterOpen={setIsGuitarMasterOpen}
                        setIsUkeleleMasterOpen={setIsUkeleleMasterOpen}
                        setIsAdding={setIsAdding}
                        setSelectedItem={setSelectedItem}
                    />
                } />
            </Routes>

            {/* Global Modals */}
            {isBluesMasterOpen && <BluesMasterModal isOpen={isBluesMasterOpen} onClose={() => setIsBluesMasterOpen(false)} user={user} addPoints={addPoints} />}
            {isPianoMasterOpen && <PianoMasterModal isOpen={isPianoMasterOpen} onClose={() => setIsPianoMasterOpen(false)} user={user} addPoints={addPoints} />}
            {isGuitarMasterOpen && <GuitarMasterModal isOpen={isGuitarMasterOpen} onClose={() => setIsGuitarMasterOpen(false)} user={user} addPoints={addPoints} />}
            {isUkeleleMasterOpen && <UkeleleMasterModal isOpen={isUkeleleMasterOpen} onClose={() => setIsUkeleleMasterOpen(false)} user={user} addPoints={addPoints} />}
            {isUserProfileOpen && <UserProfileModal isOpen={isUserProfileOpen} onClose={() => setIsUserProfileOpen(false)} user={user} stats={stats} achievements={achievements} />}
            {isMidiSettingsOpen && <MidiSettingsModal isOpen={isMidiSettingsOpen} onClose={() => setIsMidiSettingsOpen(false)} />}
            {isTunerOpen && <TunerModal isOpen={isTunerOpen} onClose={() => setIsTunerOpen(false)} />}
            {isGuitarTunerOpen && <GuitarTunerModal isOpen={isGuitarTunerOpen} onClose={() => setIsGuitarTunerOpen(false)} />}
            
            {isAdding && (
                <UnifiedLessonEditor 
                    setIsAdding={setIsAdding}
                    addItem={async (d) => {
                        const res = await addItem(d);
                        if (res.success) {
                            setIsAdding(false);
                            setSelectedItem(null);
                            window.dispatchEvent(new CustomEvent('lesson-updated', { detail: { id: res.id || selectedItem?.id } }));
                            window.dispatchEvent(new CustomEvent('collections-updated'));
                        }
                        return res;
                    }}
                    collections={collections}
                    selectedItem={selectedItem}
                    editingLessonId={selectedItem?.id}
                />
            )}

            <ProMetronomeModal 
                isOpen={isProMetroOpen} 
                onClose={() => setIsProMetroOpen(false)} 
                settings={metroSettings}
                setSettings={setMetroSettings} 
                setBpm={setBpm} 
            />

            <GlobalMidiSound />
        </MainLayout>
    );
}