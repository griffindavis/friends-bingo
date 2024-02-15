import { Auth, User } from 'firebase/auth';
import {
	Firestore,
	Timestamp,
	addDoc,
	collection,
	doc,
	getDoc,
	updateDoc,
} from 'firebase/firestore';
import { useEffect, useRef } from 'react';

function NavBar(props: {
	firestore: Firestore;
	auth: Auth;
	userAuth: User | null | undefined;
	setBoardId: React.Dispatch<React.SetStateAction<null | string>>;
	boardId: string | null;
}) {
	const { firestore, auth, userAuth, setBoardId, boardId } = props;

	const isAdmin = useRef(false);

	/**
	 * Function to log a user out
	 */
	function handleLogout() {
		auth.signOut();
	}

	/**
	 * Function to return to board select
	 */
	function handleBack() {
		setBoardId(null);
	}

	/**
	 * Handles adding a new board to the database
	 * @returns Nothing
	 */
	function handleAddBoard() {
		const newTitle = prompt("What's the title of the new board?", '');
		if (newTitle === null || newTitle === '') {
			return;
		}

		const group = prompt('Which group does this belong to?', '');
		if (group === null || group === '') {
			return;
		}

		addDoc(
			collection(
				firestore,
				`Boards${process.env.REACT_APP_ENV === 'dev' ? '-dev' : ''}`
			),
			{
				Name: newTitle,
				Group: group,
				Deleted: false,
			}
		).then((docRef) => {
			addDoc(
				collection(
					firestore,
					`Audit${process.env.REACT_APP_ENV === 'dev' ? '-dev' : ''}`
				),
				{
					Board: docRef.id,
					newValue: 'Created',
					user: userAuth?.displayName,
					datetime: Timestamp.now(),
				}
			);

			props.setBoardId(docRef.id);
		});
	}

	/**
	 * Handles deleting a board from the database
	 */
	function handleDeleteBoard() {
		const docRef = doc(
			firestore,
			`Boards${process.env.REACT_APP_ENV === 'dev' ? '-dev' : ''}/${boardId}`
		);

		addDoc(
			collection(
				firestore,
				`Audit${process.env.REACT_APP_ENV === 'dev' ? '-dev' : ''}`
			),
			{
				Board: docRef.id,
				newValue: 'Deleted',
				user: userAuth?.displayName,
				datetime: Timestamp.now(),
			}
		);

		updateDoc(docRef, { Deleted: true });
		handleBack();
	}

	useEffect(() => {
		if (auth.currentUser != null) {
			const ref = doc(
				firestore,
				`Users${process.env.REACT_APP_ENV === 'dev' ? '-dev' : ''}`,
				auth.currentUser?.uid
			);
			getDoc(ref).then((result) => {
				isAdmin.current = result?.data()?.isAdmin;
			});
		}
	});

	return (
		<>
			<nav className='navBarTop'>
				<button
					className={`navButton ${boardId === null ? 'disabled' : ''}`}
					onClick={handleBack}
				>
					Main Menu
				</button>

				<button className={`navButton`} onClick={handleAddBoard}>
					Add Board
				</button>

				<button
					className={`navButton ${boardId === null ? 'disabled' : ''} ${
						isAdmin.current === true ? '' : 'disabled'
					}`}
					onClick={handleDeleteBoard}
				>
					Delete Board
				</button>
				
				<button className='navButton' onClick={handleLogout}>
					Logout
				</button>
			</nav>
		</>
	);
}

export default NavBar;
