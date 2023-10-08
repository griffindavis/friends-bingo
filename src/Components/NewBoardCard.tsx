import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { User } from 'firebase/auth';
import { Firestore, Timestamp, addDoc, collection } from 'firebase/firestore';

function NewBoardCard(props: {
	firestore: Firestore;
	auth: User | null | undefined;
	setBoardId: React.Dispatch<React.SetStateAction<null | string>>;
}) {
	const { firestore, auth } = props;

	function handleClick() {
		const newTitle = prompt("What's the title of the new board?", '');
		if (newTitle === null || newTitle === '') {
			return;
		}

		const group = prompt('Which group does this belong to?', '');
		if (group === null || group === '') {
			return;
		}

		addDoc(collection(firestore, `Boards${process.env.REACT_APP_ENV === 'dev' ? '-dev' : ''}`), {
			Name: newTitle,
			Group: group,
		}).then((docRef) => {
			addDoc(collection(firestore, `Audit${process.env.REACT_APP_ENV === 'dev' ? '-dev' : ''}`), {
				Board: docRef.id,
				newValue: 'Created',
				user: auth?.displayName,
				datetime: Timestamp.now(),
			});

			props.setBoardId(docRef.id);
		});
	}

	return (
		<>
			<div
				className='gridItem selectionItem addGridButton'
				onClick={handleClick}
			>
				<FontAwesomeIcon icon={faPlus} size='xl' />
			</div>
		</>
	);
}

export default NewBoardCard;
