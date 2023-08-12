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
} from 'firebase/firestore';

function BoardItem(props: {
	data: IBingoBoardItem;
	firestore: Firestore;
	index: number;
}) {
	const { data, firestore, index } = props;

	function handleItemClick() {
		if (data.id !== undefined) {
			const docRef = doc(firestore, 'BoardItems', data.id);
			updateDoc(docRef, { isComplete: !data.isComplete });
		} else {
			const newTitle = prompt("What's the new bingo item?", '');
			if (newTitle === null || newTitle === '') {
				return;
			}

			addDoc(collection(firestore, 'BoardItems'), {
				displayTitle: newTitle,
				index: index,
			});
		}
	}

	function handleDelete(e: any) {
		e.stopPropagation();
		const docRef = doc(firestore, 'BoardItems', data.id);
		deleteDoc(docRef);
	}

	return (
		<div
			className={`boardItem gridItem ${data.isComplete ? 'isComplete' : ''} `}
			onClick={handleItemClick}
		>
			{data.displayTitle}
			{data.displayTitle !== undefined && index !== 12 ? (
				<FontAwesomeIcon
					className='icon'
					icon={faTrashCan}
					size='sm'
					onClick={handleDelete}
				/>
			) : null}
		</div>
	);
}

export default BoardItem;
