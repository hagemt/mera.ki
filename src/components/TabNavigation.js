import React from 'react'

import classNames from 'classnames'
import Types from 'prop-types'

import {
	Nav,
	NavItem,
	NavLink,
	TabContent,
	TabPane,
} from 'reactstrap'

class TabNavigation extends React.Component {

	constructor (...args) {
		super(...args)
		this.state = {
			activeTab: 0,
		}
	}

	activeTab (activeTab) {
		if (this.state.activeTab !== activeTab) {
			this.setState({ activeTab })
		}
	}

	render () {
		const activeTab = this.state.activeTab
		const tabs = this.props.tabs
		return (
			<div className='tab-navigation'>
				<Nav tabs>
					{tabs.map(({ title }, index) => (
						<NavItem key={`navitem-tab-${index}`}>
							<NavLink className={classNames({ active: activeTab === index })} onClick={() => this.activeTab(index)}>
								{title}
							</NavLink>
						</NavItem>
					))}
				</Nav>
				<TabContent activeTab={this.state.activeTab}>
					{tabs.map(({ element }, index) => (
						<TabPane key={`tab-${index}`} tabId={index}>
							{element}
						</TabPane>
					))}
				</TabContent>
			</div>
		)
	}

}

const tab = Types.shape({
	element: Types.element.isRequired,
	title: Types.string.isRequired,
})

TabNavigation.propTypes = {
	tabs: Types.arrayOf(tab).isRequired,
}

export default TabNavigation
