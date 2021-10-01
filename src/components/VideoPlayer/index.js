import { useEffect, useState } from 'react'
import './index.style.scss'

import { ReactComponent as Speaker } from '../../icons/speaker-icon.svg'
import MiniChat from './MiniChat'

export default function VideoPlayer({ emitingStream, messages }) {
	const [muted, setMuted] = useState(false)
	const [lastMessages, setLastMessages] = useState([])

	useEffect(() => {
		const tempMsgs = []
		let count = 0
		messages
			.slice(0)
			.reverse()
			.forEach(msg => {
				if (!msg.isNotice && count < 3) {
					count++
					tempMsgs.unshift(msg)
				}
			})
		setLastMessages([...tempMsgs])
	}, [messages])

	return (
		<div className="video-wrapper">
			{/* <button className="max">max</button> */}
			<video muted={emitingStream ? true : muted} />
			<MiniChat lastMessages={lastMessages} />
			{!emitingStream && (
				<button onClick={() => setMuted(!muted)} className={muted ? 'mute toggled' : 'mute'}>
					<Speaker />
				</button>
			)}
		</div>
	)
}
