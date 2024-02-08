import './Styles/App.css';

// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth } from 'firebase/auth';
import SignIn from './Components/SignIn';
import { Helmet } from 'react-helmet';
import Board from './Components/Board';
import { useState } from 'react';
import NavBar from './Components/NavBar';
import SelectBoard from './Components/SelectBoard';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: `${process.env.REACT_APP_API_KEY}`,
	authDomain: `${process.env.REACT_APP_AUTH_DOMAIN}`,
	projectId: `${process.env.REACT_APP_PROJECT_ID}`,
	storageBucket: `${process.env.REACT_APP_STORAGE_BUCKET}`,
	messagingSenderId: `${process.env.REACT_APP_MESSAGING_SENDER_ID}`,

	appId: `${process.env.REACT_APP_APP_ID}`,
	measurementId: `${process.env.REACT_APP_MEASUREMENT_ID}`,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const firestore = getFirestore(app);

/**
 * Main app driving function
 * @returns the rendered HTML
 */
function App() {
	const [userAuth] = useAuthState(auth);
	const [boardId, setBoardId] = useState<null | string>(null);

	return (
		<>
			<Helmet>
				<title>WI Friends Bingo!</title>
			</Helmet>
			<div className='App' key='AppWrapper'>
				{userAuth ? authenticatedApp() : <SignIn app={app} />}
			</div>
		</>
	);

	function authenticatedApp() {
		return (
			<>
				<NavBar
					firestore={firestore}
					auth={auth}
					userAuth={userAuth}
					setBoardId={setBoardId}
					boardId={boardId}
				/>
				{boardId === null ? (
					<SelectBoard
						firestore={firestore}
						auth={auth}
						setBoardId={setBoardId}
					/>
				) : (
					<Board
						boardId={boardId}
						auth={auth}
						firestore={firestore}
						userAuth={userAuth}
					/>
				)}
			</>
		);
	}
}

export default App;
