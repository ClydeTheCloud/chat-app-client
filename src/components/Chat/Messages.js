import Message from './Message'
import Notice from './Notice'

export default function Messages({ messages }) {
	return (
		<div className="messages">
			{messages.map(m => {
				return m.isNotice ? <Notice key={m.id} notice={m} /> : <Message key={m.id} message={m} />
			})}
		</div>
	)
}
