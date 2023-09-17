import IBoardData from '../Types/IBoardData';

function BoardCard(props: {
	data: IBoardData;
	setBoardId: React.Dispatch<React.SetStateAction<null | string>>;
}) {
	const { data } = props;

	function handleClick() {
		props.setBoardId(data.id);
	}

	return (
		<>
			<div
				className='gridItem boardSelectionContent selectionItem'
				onClick={handleClick}
			>
				<div className='boardTitle'>
					<div>{data.Name}</div>
				</div>
				<div className='boardDetails'>Group: {data.Group}</div>
			</div>
		</>
	);
}

export default BoardCard;
