import { Firestore, collection } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import IBoardData from '../Types/IBoardData';
import BoardCard from './BoardCard';
import { Auth, User } from 'firebase/auth';
import NewBoardCard from './NewBoardCard';

function SelectBoard(props: {
	firestore: Firestore;
	auth: Auth;
	userAuth: User | null | undefined;
	setBoardId: React.Dispatch<React.SetStateAction<null | string>>;
}) {
	const { firestore, auth, userAuth } = props;

	const [dbBoards] = useCollection(collection(firestore, 'Boards'), {
		snapshotListenOptions: { includeMetadataChanges: true },
	});

	/**
	 * Function to log a user out
	 */
	function handleLogout() {
		auth.signOut();
	}

	return (
		<>
			<button className='signOut' onClick={handleLogout}>
				Sign Out
			</button>
			<div className='gridArea'>
				{dbBoards?.docs.map((board) => {
					const data = board.data() as IBoardData;
					data.id = board.id;

					return <BoardCard data={data} setBoardId={props.setBoardId} />;
				})}
				<NewBoardCard
					firestore={firestore}
					auth={userAuth}
					setBoardId={props.setBoardId}
				/>
			</div>
		</>
	);
}
export default SelectBoard;
