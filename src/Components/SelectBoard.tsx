import {
	Firestore,
	collection,
	doc,
	getDoc,
	query,
	where,
} from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import IBoardData from '../Types/IBoardData';
import BoardCard from './BoardCard';
import { Auth } from 'firebase/auth';
import { useRef } from 'react';

function SelectBoard(props: {
	firestore: Firestore;
	auth: Auth;
	setBoardId: React.Dispatch<React.SetStateAction<null | string>>;
}) {
	const { firestore, auth } = props;

	const allowedGroups = useRef(['']);
	const allowedAll = useRef(false);

	async function getPermissions() {
		const docSnap = await getDoc(
			doc(
				firestore,
				`Users${process.env.REACT_APP_ENV === 'dev' ? '-dev' : ''}`,
				auth.currentUser?.uid || ''
			)
		);

		if (docSnap.exists()) {
			allowedGroups.current = docSnap.data().AllowedGroups;
			if (docSnap.data().AllowedAll) {
				allowedAll.current = true;
			}
		}
	}

	getPermissions();

	const queryPermissions = [];
	queryPermissions.push(where('Deleted', '==', false));
	if (!allowedAll.current) {
		if (allowedGroups.current.length > 0)
		{
			queryPermissions.push(where('Group', 'in', allowedGroups.current));
		}
		else
		{
			queryPermissions.push(where('Group', 'in', ["No Results Allowed"])) // use this here to prevent an error and to render no results
		}
	}

	const boardQuery = query(
		collection(
			firestore,
			`Boards${process.env.REACT_APP_ENV === 'dev' ? '-dev' : ''}`
		),
		...queryPermissions
	);
	const [dbBoards] = useCollection(boardQuery, {
		snapshotListenOptions: { includeMetadataChanges: true },
	});

	const allowedAny = allowedAll.current || allowedGroups.current.length > 0;

	return (
		<>
		{
			allowedAny ? <div className='gridArea'>
			{dbBoards?.docs.map((board) => {
				const data = board.data() as IBoardData;
				data.id = board.id;

				return (
					<BoardCard
						data={data}
						setBoardId={props.setBoardId}
						key={data.id}
					/>
				);
			})}
		</div>
		:
		<div>
			You're not provisioned for any groups...
		</div>
		}
			
		</>
	);
}
export default SelectBoard;
