import React from 'react'

import fetch from 'isomorphic-fetch'
import Types from 'prop-types'

import {
	Badge,
	Form,
	FormGroup,
	InputGroup,
	InputGroupButton,
	Progress,
} from 'reactstrap'

const PasswordResult = ({ zxcvbn }) => {
	if (!zxcvbn) return null
	const colors = ['', 'danger', 'warning', 'info', 'success']
	return (
		<div className='password-result'>
			<p>That password would require <Badge>{zxcvbn.crack_times_display.offline_slow_hashing_1e4_per_second}</Badge> to crack.</p>
			<Progress animated={true} color={colors[zxcvbn.score]} max={4} value={zxcvbn.score} />
		</div>
	)
}

PasswordResult.propTypes = {
	zxcvbn: Types.object,
}

class PasswordStrength extends React.Component {

	constructor (...args) {
		super(...args)
		this.state = {
			isLoading: false,
			lastError: null,
			zxcvbnResult: null,
		}
	}

	async submitPassword (password) {
		try {
			this.setState({ isLoading: true, zxcvbnResult: null })
			const response = await fetch('/auth/zxcvbn', {
				body: JSON.stringify({ password }),
				method: 'POST',
			})
			if (response.status !== 200) {
				throw new Error(response.status)
			}
			this.setState({
				zxcvbnResult: await response.json(),
			})
		} catch (error) {
			this.setState({ lastError: error })
		} finally {
			this.setState({ isLoading: false })
		}
	}

	submitForm (event) {
		this.submitPassword(this.password.value)
		event.preventDefault()
	}

	render () {
		const { isLoading, zxcvbnResult } = this.state
		return (
			<Form className='password-strength' onSubmit={(...args) => this.submitForm(...args)}>
				<FormGroup>
					<InputGroup>
						<InputGroupButton disabled={isLoading} type='submit'>Crack</InputGroupButton>
						<input className='form-control' placeholder='Password' ref={e => this.password = e} type='password' />
					</InputGroup>
				</FormGroup>
				<FormGroup>
					<PasswordResult zxcvbn={zxcvbnResult} />
				</FormGroup>
			</Form>
		)
	}

}

export default PasswordStrength
