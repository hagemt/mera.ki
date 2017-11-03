import React from 'react'

import {
	Alert,
	Form,
	FormGroup,
	FormText,
	InputGroup,
	InputGroupButton,
} from 'reactstrap'

import { CopyToClipboard } from 'react-copy-to-clipboard'

class LinkShortening extends React.Component {

	constructor (...args) {
		super(...args)
		this.state = {
			copyButtonText: 'Copy!',
			isLoading: false,
			lastError: null,
			longURL: '',
			shortURL: '',
		}
	}

	copyTimeout () {
		this.setState({ isLoading: true, copyButtonText: 'Copied!' })
		setTimeout(() => this.setState({ isLoading: false, copyButtonText: 'Copy' }), 1000)
	}

	async shortenLink (longURL) {
		try {
			this.setState({ isLoading: true, lastError: null, longURL: '', shortURL: '' })
			const response = await fetch('/api/link', { body: longURL, method: 'POST' })
			if (response.status !== 201) throw new Error(response.status)
			this.setState({ longURL, shortURL: await response.text() })
		} catch (error) {
			this.setState({ lastError: error })
		} finally {
			this.setState({ isLoading: false })
		}
	}

	resetLink (event) {
		this.setState({ longURL: '', shortURL: '' })
		event.preventDefault()
	}

	submitLink (event) {
		this.shortenLink(this.long.value)
		event.preventDefault()
	}

	render () {
		const { copyButtonText, isLoading, lastError, longURL, shortURL } = this.state
		return (
			<Form className='link-shortening' onSubmit={event => this.submitLink(event)}>
				<FormGroup>
					<Alert color='danger' isOpen={Boolean(lastError)} toggle={() => this.setState({ lastError: null })}>
						<FormText>Sorry, but that link could not be shortened.</FormText>
					</Alert>
				</FormGroup>
				<FormGroup>
					<InputGroup>
						{longURL
								? (<InputGroupButton disabled={isLoading} onClick={event => this.resetLink(event)}>Another!</InputGroupButton>)
								: (<InputGroupButton disabled={isLoading} type='submit'>Shorten</InputGroupButton>)
						}
						<input className='form-control' disabled={isLoading || longURL} placeholder='Long URL' ref={e => this.long = e} type='text' value={longURL} />
					</InputGroup>
				</FormGroup>
				<FormGroup>
					<InputGroup>
						<CopyToClipboard onCopy={(...args) => this.copyTimeout(...args)} text={shortURL}>
							<InputGroupButton disabled={!shortURL}>{copyButtonText}</InputGroupButton>
						</CopyToClipboard>
						<input className='form-control' disabled={true} placeholder='Short URL' ref={e => this.short = e} type='text' value={shortURL} />
					</InputGroup>
				</FormGroup>
			</Form>
		)
	}

}

export default LinkShortening
