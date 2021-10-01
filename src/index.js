import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom'
import { nanoid } from 'nanoid'

import './index.css'
import App from './App'

ReactDOM.render(
	<React.StrictMode>
		<Router>
			<Switch>
				<Route path="/:room" children={<App />} />
				<Route path="/">
					{/* При отсутствии в url параметра id комнаты, nanoid генерирует случайный десятизначный id и переадресует клиент на этот id */}
					<Redirect to={`/${nanoid(10)}`} />
				</Route>
			</Switch>
		</Router>
	</React.StrictMode>,
	document.getElementById('root')
)
