import React from 'react'

import FontAwesome from 'react-fontawesome'

import {
	Badge,
	Button,
	Jumbotron,
	Modal,
	ModalBody,
	ModalFooter,
	ModalHeader,
} from 'reactstrap'

import LinkShortening from './LinkShortening.js'
import PasswordStrength from './PasswordStrength.js'
import TabNavigation from './TabNavigation.js'

class Home extends React.Component {

	constructor (...args) {
		super(...args)
		this.state = {
			isModalOpen: false,
		}
	}

	toggleModal () {
		this.setState({
			isModalOpen: !this.state.isModalOpen,
		})
	}

	render () {
		return (
			<div className='home'>
				<div className='m-3 p-3 text-center'>
					<Button className='primary' onClick={() => this.toggleModal()}>Open</Button>
				</div>
				<Modal isOpen={this.state.isModalOpen} toggle={() => this.toggleModal()}>
					<ModalHeader>
						<h2>It lives!</h2>
					</ModalHeader>
					<ModalBody>
						<span>Holy shit.</span>
					</ModalBody>
					<ModalFooter>
						<Button onClick={() => this.toggleModal()}>Close</Button>
					</ModalFooter>
				</Modal>
			</div>
		)
	}

}

const Root = () => {
	const tabs = [
		{ element: (<Home />), title: 'Home' },
		{ element: (<LinkShortening />), title: 'Link Shortening' },
		{ element: (<PasswordStrength />), title: 'Password Strength' },
	]
	return (
		<div className='root'>
			<Jumbotron>
				<Badge>
					<FontAwesome name='rocket' size='4x' />
				</Badge>
				<h1>mera.ki</h1>
			</Jumbotron>
			<div className='container-fluid'>
				<TabNavigation tabs={tabs} />
			</div>
		</div>
	)
}

export default Root
