import IBingoBoardItem from '../Types/IBingoBoardItem';
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
	isAdmin: boolean;
	canEdit: boolean;
	boardPath: string;
}) {
	const { data, firestore, index, auth, isAdmin, canEdit, boardPath } = props;

	function handleItemClick() {
		if (!canEdit) {
			return;
		}
		if (data.id !== undefined) {
			const currentCompletionStatus = data.isComplete || false;
			const docRef = doc(firestore, `${boardPath}/BoardItems`, data.id);
			updateDoc(docRef, { isComplete: !data.isComplete });

			addDoc(collection(firestore, `${boardPath}/Audit`), {
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

			addDoc(collection(firestore, `${boardPath}/BoardItems`), {
				displayTitle: newTitle,
				index: index,
			}).then((docRef) => {
				addDoc(collection(firestore, `${boardPath}/Audit`), {
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
		const docRef = doc(firestore, `${boardPath}/BoardItems`, data.id);
		deleteDoc(docRef);

		addDoc(collection(firestore, `${boardPath}/Audit`), {
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

				{data.displayTitle !== undefined && isAdmin ? (
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
