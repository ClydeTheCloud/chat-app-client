import './Notice.style.scss'

// Минималистичное текстовое уведомление
export default function Notice({ notice }) {
	return <div className="notice">{notice.text}</div>
}
