import './Sidebar.style.scss'

// Сайдбар со списком всех онлайн пользователей
export default function Sidebar({ usersOnline, toggleSidebar, isSidebarOpen }) {
	return (
		<div className={isSidebarOpen ? 'sidebar open' : 'sidebar'}>
			<button onClick={toggleSidebar}>Закрыть</button>
			<ul>
				{usersOnline.map(u => (
					<li key={u.id}>{u.username}</li>
				))}
			</ul>
		</div>
	)
}
