import React, { useEffect, useState } from 'react';
import './App.css';
import BoardItem from './BoardItem';

// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore, collection } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import IBingoBoardItem from './IBingoBoardItem';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth } from 'firebase/auth';
import SignIn from './SignIn';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: 'AIzaSyDyjERVs7wnj-JWzb5RFDXYRxbpGAKxmjI',
	authDomain: 'friend-bingo.firebaseapp.com',
	projectId: 'friend-bingo',
	storageBucket: 'friend-bingo.appspot.com',
	messagingSenderId: '1021858452501',

	appId: '1:1021858452501:web:5d4e5f5b13d5e7bb0eaa1c',
	measurementId: 'G-QQN4VZZYQM',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const firestore = getFirestore(app);

const BOARD_SIZE = 5;

/**
 * Outputs the contents of the header as an array
 * @returns An array with BINGO in it
 */
function getHeader(): string[] {
	return ['B', 'I', 'N', 'G', 'O'];
}

/**
 * Creates a blank 5x5 array
 * @returns A blank 5x5 array
 */
function initializeBoardItems(): IBingoBoardItem[][] {
	const output = new Array(BOARD_SIZE)
		.fill('')
		.map(() => new Array(BOARD_SIZE).fill(''));
	return output;
}

/**
 * Converts an index number to the appropriate xy coordinates of the board
 * @param index
 * @returns an array of coordinates
 */
function convertIndexToXY(index: number): number[] {
	let row = Math.floor(index / BOARD_SIZE);
	let column = index % BOARD_SIZE;
	return [row, column];
}

/**
 * Main app driving function
 * @returns the rendered HTML
 */
function App() {
	const [userAuth] = useAuthState(auth);
	const [boardItems, setBoardItems] = useState(initializeBoardItems());

	// listen for updates to the loads on the database
	let [dbBingoItems] = useCollection(collection(firestore, 'BoardItems'), {
		snapshotListenOptions: { includeMetadataChanges: true },
	});

	// Main rerendering for reordering the pieces on the board if the index changes
	useEffect(() => {
		const newItems = initializeBoardItems();

		dbBingoItems?.docs.forEach((bingoItem) => {
			const data = bingoItem.data() as IBingoBoardItem;
			data.id = bingoItem.id;
			const [row, column] = convertIndexToXY(data.index);

			if (column >= 0 && column < 5) {
				if (row >= 0 && row < 5) {
					newItems[row][column] = data;
				}
			}
		});

		setBoardItems(newItems);
	}, [dbBingoItems, userAuth]);

	let currentIndex = 0;

	/**
	 * Function to log a user out
	 */
	function handleLogout() {
		auth.signOut();
	}

	return (
		<div className='App'>
			{userAuth ? authenticatedApp() : <SignIn app={app} />}
		</div>
	);

	function authenticatedApp() {
		return (
			<>
				<button className='signOut' onClick={handleLogout}>
					Sign Out
				</button>
				<div className='gridArea'>
					{getHeader().map((headerItem) => (
						<div className='headerItem gridItem'>{headerItem}</div>
					))}
					{boardItems.map((line) =>
						line.map((item) => (
							<BoardItem
								key={currentIndex}
								data={item}
								firestore={firestore}
								index={currentIndex++}
							></BoardItem>
						))
					)}
				</div>
			</>
		);
	}
}

export default App;
