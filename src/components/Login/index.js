import { useState } from 'react'
import './index.style.scss'

export default function Login({ setName }) {
	const [value, setValue] = useState('')
	const [error, setError] = useState('')

	const handleSumbit = e => {
		e.preventDefault()
		const isValid = validateName(value)
		if (isValid.status) {
			setName(value)
		} else {
			setError(isValid.error)
		}
	}

	const validateName = name => {
		if (name.trim().length > 15) {
			return { status: false, error: 'Слишком длинное имя' }
		} else if (name.trim().length === 0) {
			return { status: false, error: 'Введите имя' }
		} else {
			return { status: true }
		}
	}

	const changeHandler = e => {
		setValue(e.target.value)
		setError('')
	}

	return (
		<>
			<h1 className="title">ChatApp</h1>
			<form className="login" onSubmit={handleSumbit}>
				{error && <p className="error">{error}</p>}
				<input type="text" value={value} placeholder="Введите ваше имя" onChange={changeHandler} />
				<button type="submit">Войти</button>
			</form>
		</>
	)
}
