import firebase from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getFirestore, getDoc } from 'firebase/firestore';

function SignIn(props: { app: firebase.FirebaseApp }) {
	async function signInWithGoogle() {
		const auth = getAuth(props.app);
		const provider = new GoogleAuthProvider();
		await signInWithPopup(auth, provider);

		const firestore = getFirestore(props.app);
		if (auth.currentUser) {
			const ref = doc(firestore, `Users${process.env.REACT_APP_ENV === 'dev' ? '-dev' : ''}`, auth.currentUser.uid);
			if (!(await getDoc(ref)).exists())
				setDoc(ref, {
					email: auth.currentUser.email,
					name: auth.currentUser.displayName,
					isProvisioned: true,
				});
		}
	}

	return (
		<>
			<h1>WI Friends Bingo!</h1>
			<button className='sign-in' onClick={signInWithGoogle}>
				Sign in with Google
			</button>
		</>
	);
}

export default SignIn;
