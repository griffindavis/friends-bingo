import { Auth, User } from 'firebase/auth';
import IBingoBoardItem from '../Types/IBingoBoardItem';
import { useEffect, useRef, useState } from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { Firestore, collection, doc, getDoc } from 'firebase/firestore';
import BoardItem from './BoardItem';

function Board(props: {
	boardId: string;
	auth: Auth;
	firestore: Firestore;
	userAuth: User | null | undefined;
	setBoardId: React.Dispatch<React.SetStateAction<null | string>>;
}) {
	const { boardId, auth, firestore, userAuth, setBoardId } = props;

	const isAdmin = useRef(false);
	const canEdit = useRef(false);
	const BOARD_SIZE = 5;
	let currentIndex = 0;
	const BOARD_PATH = `Boards/${boardId}`;

	useEffect(() => {
		if (auth.currentUser != null) {
			const ref = doc(firestore, 'Users', auth.currentUser?.uid);
			getDoc(ref).then((result) => {
				isAdmin.current = result?.data()?.isAdmin;
				canEdit.current = result?.data()?.canEdit;
			});
		}
	});

	const [boardItems, setBoardItems] = useState(initializeBoardItems());

	// listen for updates to the loads on the database
	let [dbBingoItems] = useCollection(
		collection(firestore, `${BOARD_PATH}/BoardItems`),
		{
			snapshotListenOptions: { includeMetadataChanges: true },
		}
	);

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
							auth={userAuth}
							isAdmin={isAdmin.current}
							canEdit={canEdit.current}
							boardPath={BOARD_PATH}
						></BoardItem>
					))
				)}
			</div>
			<button className='goBack' onClick={handleBack}>
				Go Back
			</button>
		</>
	);
}
export default Board;
