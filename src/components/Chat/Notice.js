import './Notice.style.scss'

export default function Notice({ notice }) {
	return <div className="notice">{notice.text}</div>
}
