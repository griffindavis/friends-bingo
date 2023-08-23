import IBingoBoardItem from './IBingoBoardItem';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan } from '@fortawesome/free-regular-svg-icons';
import {
	Firestore,
	doc,
	updateDoc,
	collection,
	addDoc,
	deleteDoc,
	Timestamp,
} from 'firebase/firestore';
import { User } from 'firebase/auth';

function BoardItem(props: {
	data: IBingoBoardItem;
	firestore: Firestore;
	index: number;
	auth: User | null | undefined;
}) {
	const { data, firestore, index, auth } = props;

	function handleItemClick() {
		if (data.id !== undefined) {
			const currentCompletionStatus = data.isComplete;
			const docRef = doc(firestore, 'BoardItems', data.id);
			updateDoc(docRef, { isComplete: !data.isComplete });

			addDoc(collection(firestore, 'Audit'), {
				boardItem: docRef.id,
				editedProperty: 'isComplete',
				previousValue: currentCompletionStatus,
				newValue: !currentCompletionStatus,
				user: auth?.displayName,
				datetime: Timestamp.now(),
			});
		} else {
			const newTitle = prompt("What's the new bingo item?", '');
			if (newTitle === null || newTitle === '') {
				return;
			}

			addDoc(collection(firestore, 'BoardItems'), {
				displayTitle: newTitle,
				index: index,
			}).then((docRef) => {
				addDoc(collection(firestore, 'Audit'), {
					boardItem: docRef.id,
					editedProperty: 'displayTitle',
					newValue: newTitle,
					user: auth?.displayName,
					datetime: Timestamp.now(),
				});
			});
		}
	}

	function handleDelete(e: any) {
		e.stopPropagation();
		const docRef = doc(firestore, 'BoardItems', data.id);
		deleteDoc(docRef);

		addDoc(collection(firestore, 'Audit'), {
			boardItem: docRef.id,
			editedProperty: 'deleted',
			previousValue: data.displayTitle,
			user: auth?.displayName,
			datetime: Timestamp.now(),
		});
	}

	return (
		<div
			className={`boardItem gridItem ${data.isComplete ? 'isComplete' : ''} `}
			onClick={handleItemClick}
		>
			<div className='itemContent'>
				<div>{data.displayTitle}</div>

				{data.displayTitle !== undefined && index !== 12 ? (
					<div className='trash-container'>
						<FontAwesomeIcon
							className='delete-icon'
							icon={faTrashCan}
							size='sm'
							onClick={handleDelete}
						/>
					</div>
				) : null}
			</div>
		</div>
	);
}

export default BoardItem;
