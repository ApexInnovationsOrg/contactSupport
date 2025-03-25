"use strict"

import fetch from "isomorphic-fetch"
import React from "react"
import ReactDOM from "react-dom"
import Button from "react-bootstrap/Button"
import Dropdown from "react-bootstrap/Dropdown"
import MaskedInput from "react-maskedinput"
import { validate as validateEmail } from "email-validator"
import lodash from "lodash"
import FontAwesomeIcon from "react-fontawesome"
import decode from "unescape"
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html"
import { useDropzone } from 'react-dropzone'
// import { hasFlashPlayerVersion } from "swfobject";

import "font-awesome/css/font-awesome.css"
import "./styles.scss"

class ContactUs extends React.Component {
	constructor(props) {
		super(props)

		let component = this

		this.contactPreferences = [
			// {
			// 	key: "phone",
			// 	title: "Phone",
			// 	icon: "phone",
			// 	actionHeader: "We'll call you.",
			// 	// actionLabel: "within 10 minutes.",
			// 	disabledMessage: "Callback assistance is available M-F 8 am - 4 pm CST.",
			// 	condition: () => {
			// 		return true
			// 		// return !this.isAfterHours();
			// 	},
			// 	control: function(key) {
			// 		return (
			// 			<div
			// 				key={"phoneControlContainer_" + key}
			// 				className={component.state.contactPreference === this.key ? "" : "hidden"}
			// 			>
			// 				<label key={"phoneControlLabel_" + key} className="secondary-text">
			// 					Please provide a phone number where we can reach you.
			// 				</label>
			// 				<MaskedInput
			// 					key={"phoneControlInput_" + key}
			// 					mask="(111) 111-1111"
			// 					type="tel"
			// 					pattern="((\(\d{3}\) ?)|(\d{3}-))?\d{3}-\d{4}"
			// 					required
			// 					defaultValue={component.state.phoneNumber}
			// 					value={component.state.phoneNumber}
			// 					autoFocus
			// 					onChange={event => component.setState({ phoneNumber: event.target.value })}
			// 					placeholder="(555) 555-5555"
			// 				/>
			// 			</div>
			// 		)
			// 	}
			// },
			{
				key: "email",
				title: "Email",
				icon: "envelope",
				actionHeader: "We'll email you.",
				// actionLabel: "within 24 hours.",
				condition: () => {
					return true
				},
				control: function(key) {
					return (
						<div
							key={"emailControlContainer_" + key}
							className={component.state.contactPreference === this.key ? "" : "hidden"}
						>
							<label key={"emailControlLabel_" + key} className="secondary-text">
								Please provide an email address where we can reach you.
							</label>
							<input
								key={"emailControlInput_" + key}
								type="email"
								placeholder="janedoe@gmail.com"
								required
								pattern="/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/"
								defaultValue={component.state.emailAddress}
								value={component.state.emailAddress}
								autoFocus
								onChange={event => component.setState({ emailAddress: event.target.value })}
							/>
						</div>
					)
				}
			}
		]

		// Changing contact preference action labels based on whether it's after hours or not
		// let phoneContactPreference = lodash.find(this.contactPreferences, {
		// 	key: "phone"
		// });
		// phoneContactPreference.actionLabel = "within " + (this.isAfterHours() ? "24 hours" : "10 minutes") + ".";

		// let emailContactPreference = lodash.find(this.contactPreferences, {
		// 	key: "email"
		// });
		// emailContactPreference.actionLabel = "within " + (this.isAfterHours() ? "24 hours" : "an hour") + ".";

		this.defaultState = {
			firstName: typeof user !== "undefined" ? lodash.get(user, "firstName") : "",
			lastName: typeof user !== "undefined" ? lodash.get(user, "lastName") : "",
			contactPreference:
				lodash.filter(this.contactPreferences, preference => {
					return preference.condition()
				}).length === 1
					? "email"
					: "",
			selectedIssue: null,
			canSubmit: false,
			selectedIssue: null,
			problemOverview: "",
			description: "",
			emailAddress: typeof user !== "undefined" ? lodash.get(user, "email") : "",
			phoneNumber: "",
			requestingSupport: false,
			doneEditing: false,
			submitting: false,
			submitted: false,
			errors: [],
			notices: [],
			commonQuestions: [],
			attachments: []
		}

		this.state = { ...this.defaultState }

		this.issueSuggestions = [
			{ 
				value: "I don't remember my login email and/or password.",
				condition: () => this.state.contactPreference === "email",
				reason: "Requesting your login information may only be requested by using the email contact preference."
			},
			{
				value: "I need to update my name and/or email address.",
				condition: () => this.state.contactPreference === "email",
				reason: "Name and/or email address updates may only be requested using the email contact preference."
			},
			{
				value: "I need a copy of my certificate(s).",
				itemLabel: "course",
				items: [],
				condition: () => this.state.contactPreference === "email",
				reason: "Certificate copies may only be requested using the email contact preference."
			},
			{
				value: "I need to sync my score to my LMS.",
				itemLabel: "course",
				items: []
			},
			{
				value: "I need a test reset.",
				itemLabel: "course",
				items: []
			},
			{
				value: "I'm logged in, but I can't access the course.",
				itemLabel: "course",
				items: []
			},
			{
				value: "Something else...",
				itemLabel: "course",
				items: [],
				itemOptional: true
			}
		]
		
		this.rootSite = "";
		if(window.location.host == 'login.apexinnovations.com'){
			this.rootSite = "https://www.apexinnovations.com";
		}
		if(window.location.host == 'local.apexinnovations.com'){
			this.rootSite = "https://local.apexinnovations.com";	
			// this.rootSite = "https://www.apexinnovations.com";		
		}
	}

	isAfterHours = () => {
		let today = new Date()
		let theDay = today.getDay()

		let localeString = today.toLocaleTimeString("en-US", {
			timeZone: "America/Chicago",
			hour12: false
		})
		let hoursRightNow = parseInt(lodash.first(localeString.split(":")))

		// NOT Mon. - Fri. between 7am - 4pm
		return !(theDay > 0 && theDay < 6 && (hoursRightNow < 16 && hoursRightNow > 6))
	}

	reset() {
		this.setState(this.defaultState)

		this.getNotices()
		this.getCommonQuestions()
	}

	getNotices = () => {
		this.state.notices = []
		
		fetch(this.rootSite + "/admin/techSupport/notices", {
			method: "GET"
		})
			.then(response => {
				return response.json()
			})
			.then(data => {
				this.setState({
					notices: data
				})
			})
	}

	getCommonQuestions = () => {
		this.state.commonQuestions = []

		fetch(this.rootSite + "/admin/techSupport/commonQuestions", {
			method: "GET"
		})
			.then(response => {
				return response.json()
			})
			.then(data => {
				this.setState({
					commonQuestions: data
				})
			})
	}

	getCourses = () => {
		fetch(this.rootSite + "/admin/techSupport/products", {
			method: "GET"
		})
			.then(response => {
				return response.json()
			})
			.then(data => {
				// populate items arrays with courses
				this.issueSuggestions = lodash.map(this.issueSuggestions, issue => {
					if (lodash.get(issue, "items") && issue.itemLabel === "course") issue.items = data

					return issue
				})
			})
	}

	getClientInfo() {
		// https://stackoverflow.com/a/11219680

		var nVer = navigator.appVersion
		var nAgt = navigator.userAgent
		var browserName = navigator.appName
		var fullVersion = "" + parseFloat(nVer)
		var majorVersion = parseInt(nVer, 10)
		var nameOffset, verOffset, ix

		// In Opera, the true version is after "Opera" or after "Version"
		if ((verOffset = nAgt.indexOf("Opera")) != -1) {
			browserName = "Opera"
			fullVersion = nAgt.substring(verOffset + 6)
			if ((verOffset = nAgt.indexOf("Version")) != -1) fullVersion = nAgt.substring(verOffset + 8)
		}
		// In MSIE, the true version is after "MSIE" in userAgent
		else if ((verOffset = nAgt.indexOf("MSIE")) != -1) {
			browserName = "Microsoft Internet Explorer"
			fullVersion = nAgt.substring(verOffset + 5)
		}
		// In Chrome, the true version is after "Chrome"
		else if ((verOffset = nAgt.indexOf("Chrome")) != -1) {
			browserName = "Chrome"
			fullVersion = nAgt.substring(verOffset + 7)
		}
		// In Safari, the true version is after "Safari" or after "Version"
		else if ((verOffset = nAgt.indexOf("Safari")) != -1) {
			browserName = "Safari"
			fullVersion = nAgt.substring(verOffset + 7)
			if ((verOffset = nAgt.indexOf("Version")) != -1) fullVersion = nAgt.substring(verOffset + 8)
		}
		// In Firefox, the true version is after "Firefox"
		else if ((verOffset = nAgt.indexOf("Firefox")) != -1) {
			browserName = "Firefox"
			fullVersion = nAgt.substring(verOffset + 8)
		}
		// In most other browsers, "name/version" is at the end of userAgent
		else if ((nameOffset = nAgt.lastIndexOf(" ") + 1) < (verOffset = nAgt.lastIndexOf("/"))) {
			browserName = nAgt.substring(nameOffset, verOffset)
			fullVersion = nAgt.substring(verOffset + 1)
			if (lodash.toLower(browserName) == lodash.toUpper(browserName)) {
				browserName = navigator.appName
			}
		}
		// trim the fullVersion string at semicolon/space if present
		if ((ix = fullVersion.indexOf(";")) != -1) fullVersion = fullVersion.substring(0, ix)
		if ((ix = fullVersion.indexOf(" ")) != -1) fullVersion = fullVersion.substring(0, ix)

		majorVersion = parseInt("" + fullVersion, 10)
		if (isNaN(majorVersion)) {
			fullVersion = "" + parseFloat(nVer)
			majorVersion = parseInt(nVer, 10)
		}

		let clientInfo = {
			browser: browserName,
			majorVersion: majorVersion,
			fullVersion: fullVersion,
			userAgent: navigator.userAgent
		}

		let browserDescription = lodash
			.map(clientInfo, (info, key) => {
				switch (key) {
					case "browser":
						return info
					case "majorVersion":
						return " " + info
					case "fullVersion":
						return " (" + info + ")"
					default:
						return ""
				}
			})
			.join("")

		var hasFlash = false
		try {
			hasFlash = Boolean(new ActiveXObject("ShockwaveFlash.ShockwaveFlash"))
		} catch (exception) {
			hasFlash = "undefined" != typeof navigator.mimeTypes["application/x-shockwave-flash"]
		}
		browserDescription += " — Flash " + (hasFlash ? "" : "Not") + " Installed"

		return browserDescription
	}

	getContactPreference(key) {
		return lodash.find(this.contactPreferences, {
			key: key
		})
	}

	readyForContactPreference() {
		return true
	}

	readyForFirstAndLastName() {
		return (
			this.readyForContactPreference() &&
			this.state.contactPreference &&
			((this.state.contactPreference === "phone" && this.state.phoneNumber) ||
				(this.state.contactPreference === "email" &&
					this.state.emailAddress &&
					validateEmail(this.state.emailAddress)))
		)
	}

	readyForProblemCategory() {
		return this.readyForFirstAndLastName() && this.state.firstName && this.state.lastName
	}

	readyForProblemOverview() {
		return this.readyForProblemCategory() && this.state.selectedIssue
	}

	readyForDescription() {
		return this.readyForProblemOverview() && this.state.problemOverview
	}

	readyForDoneEditing() {
		return this.readyForDescription() && this.state.description
	}

	readyForSubmit() {
		return this.readyForDoneEditing() && this.state.doneEditing
	}

	compiledDescriptionForSubmitting() {
		let userNameString = this.state.firstName + " " + this.state.lastName
		if (typeof user !== "undefined") {
			userNameString =
				"<a title='Go to user in admin panel' href='" +
				window.location.origin +
				"/admin/EditUsers.php?ID=" +
				user.id +
				"'>" +
				userNameString +
				(user.admin === "Y" ? " (Admin)" : "")
				+ "</a>"
		}

		return (
			"Name: " +
			userNameString +
			"<br><br>" +
			"Issue: " +
			lodash.get(this.state.selectedIssue, "value") +
			"<br><br>" +
			(lodash.get(this.state.selectedIssue, "itemLabel")
				? lodash.capitalize(lodash.get(this.state.selectedIssue, "itemLabel")) +
				  ": " +
				  this.state.problemOverview
				: this.state.problemOverview) +
			"<br><br>" +
			"Description:<br>" +
			this.state.description
		)
	}

	componentDidUpdate(prevProps, prevState) {
		// any type of request requires problem overview and description
		let canSubmit = this.readyForSubmit()

		switch (this.state.contactPreference) {
			case "phone":
			default:
				// can submit phone request if phone number is provided
				canSubmit = canSubmit && /((\(\d{3}\) ?)|(\d{3}-))?\d{3}-\d{4}/.test(this.state.phoneNumber)
				break

			case "email":
				// can submit email request if email address is provided
				canSubmit = canSubmit && validateEmail(this.state.emailAddress)
				break
		}

		// only update the can submit if the previous state was disabled
		if (prevState.canSubmit !== canSubmit) {
			this.setState({ canSubmit: canSubmit })
		}

		// check if selected issue needs to be changed because the condition is no longer met
		if (prevState.contactPreference !== this.state.contactPreference) {
			if (
				typeof lodash.get(this.state.selectedIssue, "condition") === "function" &&
				!this.state.selectedIssue.condition()
			) {
				this.setState({
					selectedIssue: null
				})
			}
		}
	}

	submitTicket = () => {
		this.setState({
			submitting: true,
			canSubmit: false
		})

		let userNameString = this.state.firstName + " " + this.state.lastName
		let userNameStringLink = ''
		if (typeof user !== "undefined") {
			userNameStringLink =
				"<a title='Go to user in admin panel' href='" +
				window.location.origin +
				"/admin/EditUsers.php?ID=" +
				user.id +
				"'>" +
				userNameString +
				(user.admin === "Y" ? " (Admin)" : "") +
				"</a>"
		}

		let options = {
			userName: userNameString,
			userNameLink: userNameStringLink,
			contactPreference: this.state.contactPreference,
			phoneNumber: this.state.phoneNumber.replace(/[^0-9]/g, ""),
			problemOverview:
				(this.state.selectedIssue ? this.state.selectedIssue.value + " — " : "") + this.state.problemOverview,
			description: this.state.description,
			browserInfo: this.getClientInfo()
		}

		switch (this.state.contactPreference) {
			case "phone":
			default:
				options.contactInfo = this.state.phoneNumber.replace(/[^0-9]/g, "")
				break

			case "email":
				options.contactInfo = this.state.emailAddress
				break
		}

		fetch(this.rootSite + "/admin/techSupport/submitTicket", {
			method: "POST",
			body: JSON.stringify(options)
		})
			.then(response => {
				return response.json()
			})
			.then(data => {
				this.setState({
					submitting: false,
					submitted: data.success,
					errors: lodash.get(data, "errors") || []
				})
				this.addAttachmentToTicket(data.ticketID)
			})
			.catch(error => {
				this.setState({
					submitting: false,
					submitted: false,
					errors: [error.message]
				})
			})
		
	}

	submitText() {
		if (this.state.submitting) {
			return "Submitting..."
		}

		if (this.state.submitted) {
			return "Submitted!"
		}

		return "Submit"
	}
	
	formData = {
		attachmentData: new FormData()
	}
		
	addAttachmentToTicket(ticketID){
		this.formData.attachmentData.append('ticketID', ticketID)
		
		fetch(this.rootSite + "/admin/techSupport/submitTicketAttachment", {
			method: "POST",
			body: this.formData.attachmentData
		})
		.then(response => {
			return response.json()
		})
		.catch(error => {
			this.setState({
				errors: [error.message]
			})
		})
	}
	
	fileDropZone = (props) => {
				
		const {acceptedFiles, fileRejections, getRootProps, getInputProps} = useDropzone({
			accept: 'image/jpg, image/jpeg, image/png, image/gif, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			maxSize: 10485760,
			onDropAccepted: acceptedFiles => {
				if(this.state.attachments.length >= 2){
					$('.fileRejectionErrorReason').html(" Maximum number of files attached.");
					$('.fileRejectionError').fadeIn('fast').delay(2000).fadeOut('fast');
				}else{
					this.setState({
						attachments: [...this.state.attachments, acceptedFiles[0]]
					})
					this.formData.attachmentData.append('attachments[]',acceptedFiles[0])
				}				
			},
			onDropRejected: rejectedFiles => {
				var response = "";
				var errors = rejectedFiles[0].errors;
				errors.forEach(function(error){
					switch(error.code){
						case "file-too-large":
							response = response.concat(" File too large.");
							break;
						case "file-invalid-type":
							response = response.concat(" Invalid file type.");
							break;
						default:
							response = response.concat(" Invalid file.");
					}
				});
				$('.fileRejectionErrorReason').html(response);
				$('.fileRejectionError').fadeIn('fast').delay(2500).fadeOut('fast');
			}
		});
				
		const files = this.state.attachments.map((file,i) => (
			<li key={file.path}>
				<FontAwesomeIcon name="file-o" size="md" className={"drop-attachment-file"}/> {file.path.substring(0,33)} <FontAwesomeIcon name="trash-o" size="sm" className={"drop-attachment-trash"} onClick={
					() => { 
						var newAttachments = [...this.state.attachments];
						newAttachments.splice(i,1);
						this.setState({
							attachments: newAttachments
						})
					}}/>
			</li>
		));
		 
		return ( 
			<div>
			   <label 
					className={"secondary-text"}
					style={{
						marginTop: "1.5em"
					}}
				>
					Add attachments if needed.
				</label>
				<div {...getRootProps({className: 'dropzone drop-attachment'})}>
					<input {...getInputProps()} />
					<FontAwesomeIcon name="copy" size="lg"/>
					<br/><br/>
					Drop to add attachment
				</div>
				<div>
					<label 
						className={"secondary-text"} 
						style={{ 
							fontSize: "0.65em"
						}}
					>
						Allowed File Types: png, jpg, gif, doc, xls. Maximum of 2 files. Maximum 10MB size.
					</label>
				</div>
				<div
					style={{
						marginTop: "0.5em"
					}}
				>
					<ul className={"drop-attachment-files"}>{files}</ul>
					<span 
						className={"fileRejectionError"} 
						style={{ 
							display: "none",
							color: "darkred"
						}}
					>
						<FontAwesomeIcon name="exclamation-circle" size="md"/> Error uploading file -<span className={"fileRejectionErrorReason"}></span>
					</span>
				</div>			
			</div>
		);
	}
	
	showAttachmentFiles = () => {
		const files = this.state.attachments.map((file,i) => (
			<div>
				<FontAwesomeIcon name="file-o" size="md" className={"drop-attachment-file"}/> {file.path.substring(0,33)} <FontAwesomeIcon name="trash-o" size="sm" className={"drop-attachment-trash"} onClick={
					() => { 
						var newAttachments = [...this.state.attachments];
						newAttachments.splice(i,1);
						this.setState({
							attachments: newAttachments
						})
					}}/>
			</div>
		));
		
		return (
			<div style={{ marginTop: "1em" }}>
				<label className="tiny secondary-text">Attachments</label>
				<label>{files.length > 0 ? files : "-None-"}</label>
			</div>
		);
	}
	
	render() {
		let submitVerbiage = this.submitText()

		return (
			<div>
				<a
					id="customerSupportHelpButton"
					title="Get help"
					onClick={() => {
						this.getNotices()
						this.getCommonQuestions()
						 
						$("#customerSupportHelpModal").modal("toggle")
						// console.log(document.getElementById('customerSupportHelpModal'));
					}}
					data-toggle="modal"
				>
					<FontAwesomeIcon className="visible-xs-inline-block" name="question-circle" size="lg" />
					<span className="visible-md-inline-block visible-lg-inline-block visible-xl-inline-block">
						Need help?
					</span>
				</a>

				<div id="customerSupportHelpModal" className="modal" role="dialog">
					<div className="modal-dialog">
						<div className="modal-content">
							<div className="modal-header">
								<strong
									style={{
										color: "#D20000"
									}}
								>
									Customer/Technical Support
								</strong>
								<FontAwesomeIcon name="close" className="close" data-dismiss="modal" />
							</div>

							<div className="modal-body">
								{/* Notices */}
								{this.state.notices.map((notice, i) => {
									return (
										<div key={"notice_" + i} className="notice">
											<strong className="fullWidth">Support Notice</strong>
											<label className="fullWidth" dangerouslySetInnerHTML={{ __html: notice }} />
											<a
												onClick={() =>
													this.setState({
														notices: this.state.notices.filter((_value, index) => {
															return index !== i
														})
													})
												}
											>
												Close message
											</a>
										</div>
									)
								})}

								{/* Initial View */}
								<div className={this.state.requestingSupport ? "hidden" : ""}>
									{/* Common Questions */}
									<div
										className={
											"commonQuestions card " +
											(lodash.isEmpty(this.state.commonQuestions) ? "hidden" : "")
										}
									>
										<strong>Common Questions</strong>
										<ul>
											{this.state.commonQuestions.map((commonQuestion, i) => {
												return (
													<li key={"commonQuestion_item_" + i}>
														<a
															key={"commonQuestion_title" + i}
															onClick={() =>
																this.setState({
																	openedCommonQuestion:
																		this.state.openedCommonQuestion === i ? null : i
																})
															}
															dangerouslySetInnerHTML={{
																__html: decode(commonQuestion.title)
															}}
														/>
														<div
															key={"commonQuestion_content_" + i}
															className={
																this.state.openedCommonQuestion === i ? "" : "hidden"
															}
															dangerouslySetInnerHTML={{
																__html: decode(commonQuestion.content)
															}}
														/>
													</li>
												)
											})}
										</ul>
										<div class="row section">
											<Button
												variant="danger"
												onClick={() => {
													window.location.href = "/FAQs.php"
												}}
											>
												<span>View All</span>
												<FontAwesomeIcon name="external-link" />
											</Button>
										</div>
									</div>

									<hr className={lodash.isEmpty(this.state.commonQuestions) ? "hidden" : ""} />

									<div className="row">
										<label className="secondary-text">Still having trouble?</label>
										<Button
											variant="secondary"
											onClick={() => {
												this.getCourses()

												this.setState({ requestingSupport: true })
											}}
										>
											<FontAwesomeIcon name="life-ring" />
											<span>Contact Support</span>
											<FontAwesomeIcon name="caret-right" />
										</Button>
									</div>
								</div>

								{/* Request Support View */}
								<div className={this.state.requestingSupport ? "" : "hidden"}>
									<div className="row valign-wrapper flexed">
										<Button
											style={{
												color: "#d20000"
											}}
											variant="link"
											onClick={() => this.reset()}
										>
											<FontAwesomeIcon name="angle-left" /> Back
										</Button>

										<strong
											style={{
												fontSize: "0.9em",
												color: "#444444",
												marginLeft: "0.4em"
											}}
										>
											Contacting Support
										</strong>

										<Button
											style={{
												visibility: "hidden",
												pointerEvents: "none",
												color: "#d20000"
											}}
											variant="link"
											onClick={() => this.setState({ requestingSupport: false })}
										>
											<FontAwesomeIcon name="angle-left" /> Back
										</Button>
									</div>

									{/* Post-Submit Display */}
									<div
										className={
											"text-center section collapsible " +
											(this.state.submitting ||
											this.state.submitted ||
											this.state.errors.length > 0
												? ""
												: "collapsed")
										}
									>
										<FontAwesomeIcon
											name={(() => {
												if (this.state.submitting) return "circle-o-notch"
												if (this.state.submitted) return "check-circle"

												return "times-circle"
											})()}
											size="3x"
											spin={this.state.submitting ? "spin" : ""}
											style={{
												color: (() => {
													if (this.state.submitting) return "#cccccc"
													if (this.state.submitted) return "#40a138"

													return "#D20000"
												})()
											}}
										/>

										<label className="row section secondary-text">
											{/* Submitting... */}
											{this.state.submitting ? "Submitting your support request." : ""}
											{/* Submitted */}
											{this.state.submitted ? <div><p>Your support request was submitted successfully.</p><p><strong>Please do not submit another request or call for assistance for the same issue, we will get back to you as soon as possible.</strong></p></div>	: ""}
											{/* Error */}
											<span
												style={{
													color: "#d20000"
												}}
											>
												{this.state.errors.length > 0
													? this.state.errors.map((error, i) => {
															return (
																<div>
																	<label
																		key={"error_" + i}
																		className="secondary-text"
																	>
																		{error}
																	</label>
																	<Button
																		variant="secondary"
																		onClick={() =>
																			this.setState({
																				submitting: false,
																				submitted: false,
																				errors: []
																			})
																		}
																	>
																		<FontAwesomeIcon name="caret-left" />
																		<span>Try Again</span>
																	</Button>
																</div>
															)
													  })
													: ""}
											</span>
										</label>
									</div>

									{/* Pre-Submit Display */}
									<div
										className={
											"collapsible " +
											(!(
												this.state.submitting ||
												this.state.submitted ||
												this.state.errors.length > 0
											)
												? ""
												: "collapsed")
										}
									>
										{/* Editing Display */}
										<div className={"collapsible " + (this.state.doneEditing ? "collapsed" : "")}>
											{/* Contact Preference */}
											<div
												className={
													"row text-center collapsible " +
													(this.readyForContactPreference() ? "" : "collapsed")
												}
											>
												<label className="secondary-text">
													How would you like to be contacted?
												</label>

												{/* Buttons */}
												<div className="row section valign-wrapper text-center">
													{this.contactPreferences.map((preference, key) => {
														return (
															<div
																key={"contactPreference_" + key}
																className="valign-wrapper"
															>
																<FontAwesomeIcon
																	key={"icon_" + key}
																	name={preference.icon}
																	className={
																		"contactSelection " +
																		(this.state.contactPreference === preference.key
																			? "selected"
																			: "") +
																		" " +
																		(!preference.condition() ? "" : "")
																	}
																	onClick={() => {
																		this.setState({
																			contactPreference: preference.key
																		})
																	}}
																	title={
																		!preference.condition()
																			? preference.disabledMessage
																			: preference.title
																	}
																/>
																<div
																	className={
																		"text-left " +
																		(this.state.contactPreference ===
																			preference.key && preference.condition()
																			? ""
																			: "hidden")
																	}
																	style={{
																		marginLeft: "0.4em",
																		paddingRight: "2em"
																	}}
																>
																	<h3 key={"preferenceActionHeader_" + key}>
																		{preference.actionHeader}
																	</h3>
																	<label
																		key={"preferenceActionLabel_" + key}
																		className="secondary-text"
																	>
																		{preference.actionLabel}
																	</label>
																</div>
															</div>
														)
													})}
												</div>

												{/* Controls */}
												<div className="row section">
													{this.contactPreferences.map((preference, i) => {
														if (!preference.condition())
															return (
																<p
																	key={"disabledContactPreferenceMessage_" + i}
																	className={
																		"tiny " +
																		(this.state.contactPreference === preference.key
																			? ""
																			: "hidden")
																	}
																	style={{
																		color: "#d20000",
																		marginBottom: "0.4em"
																	}}
																>
																	{preference.disabledMessage}
																</p>
															)

														return preference.control(i)
													})}
												</div>
											</div>

											{/* First and Last Name */}
											<div
												className={
													"row section collapsible " +
													(this.readyForFirstAndLastName() ? "" : "collapsed")
												}
											>
												<hr />

												{/* user not logged in */}
												{typeof user === "undefined" && (
													<div>

														<label className="secondary-text">
															First things first: we need to know who you are!
														</label>

														<input
															type="text"
															autoFocus
															required
															maxLength="25"
															placeholder="First Name"
															defaultValue={this.state.firstName}
															value={this.state.firstName}
															onChange={event =>
																this.setState({ firstName: event.target.value })
															}
														/>
														<input
															type="text"
															required
															maxLength="25"
															placeholder="Last Name"
															defaultValue={this.state.lastName}
															value={this.state.lastName}
															onChange={event =>
																this.setState({ lastName: event.target.value })
															}
														/>
														
														<br/>
														<br/>
														<label className="secondary-text">
															(Optional) Want to provide a phone number?
														</label>

														<MaskedInput
															key={"phoneControlInput"}
															mask="(111) 111-1111"
															type="tel"
															pattern="((\(\d{3}\) ?)|(\d{3}-))?\d{3}-\d{4}"
															required
															defaultValue={this.state.phoneNumber}
															value={this.state.phoneNumber}
															autoFocus
															onChange={event => this.setState({ phoneNumber: event.target.value })}
															placeholder="(555) 555-5555"
														/>
													</div>
												)}

												{/* user logged in */}
												{typeof user !== "undefined" && (
													<label>
														<span className="secondary-text">You're logged in as</span>
														<strong>
															{" "}
															{user.firstName} {user.lastName}
														</strong>
														<span>.</span>
														{user.admin === "Y" && (
															<label
																className="secondary-text"
																style={{ marginTop: "0.3em" }}
															>
																If you're requesting support on behalf of another user,
																be sure to provide their information in the description
																field later.
															</label>
														)}
													</label>
												)}
											</div>

											{/* Problem Category Selection */}
											<div
												className={
													"selectedIssueSelectionContainer row section collapsible " +
													(this.readyForProblemCategory() ? "" : "collapsed")
												}
											>
												<label className="secondary-text">
													Thanks, <span>{this.state.firstName}</span>. What are you having
													trouble with?
												</label>

												<Dropdown>
													<Dropdown.Toggle variant="secondary">
														<span>
															{lodash.get(this.state.selectedIssue, "value") ||
																"Select an issue..."}
														</span>
														<FontAwesomeIcon name="caret-down" />
													</Dropdown.Toggle>
													<Dropdown.Menu>
														{this.issueSuggestions.map((issue, i) => {
															let disabled =
																typeof issue.condition === "function" &&
																!issue.condition()

															return (
																<Dropdown.Item
																	key={"issueItem_" + i}
																	title={issue.value}
																	onClick={() => {
																		this.setState({
																			selectedIssue: issue,
																			problemOverview: ""
																		})

																		if (!lodash.get(issue, "items")) {
																			this.setState({
																				problemOverview: issue.value
																			})
																		}
																	}}
																	disabled={disabled}
																>
																	<p>{issue.value}</p>
																	{disabled && (
																		<i className="text-danger">{issue.reason}</i>
																	)}
																</Dropdown.Item>
															)
														})}
													</Dropdown.Menu>
												</Dropdown>

												{lodash.get(this.state.selectedIssue, "items") && (
													<Dropdown>
														<Dropdown.Toggle variant="secondary">
															<span>
																{!this.state.selectedIssue.itemOptional &&
																this.state.problemOverview
																	? this.state.problemOverview
																	: "Select a " +
																	  this.state.selectedIssue.itemLabel +
																	  (this.state.selectedIssue.itemOptional
																			? " (if applicable)"
																			: "")}
															</span>
															<FontAwesomeIcon name="caret-down" />
														</Dropdown.Toggle>

														<Dropdown.Menu>
															{this.state.selectedIssue.items.map((item, i) => {
																return (
																	<Dropdown.Item
																		key={"issueItem_" + i}
																		title={item}
																		onClick={() =>
																			this.setState({
																				problemOverview: item
																			})
																		}
																	>
																		{item}
																	</Dropdown.Item>
																)
															})}
														</Dropdown.Menu>
													</Dropdown>
												)}
											</div>

											{/* Problem Overview */}
											{/* Only show the problem overview if they selected the "Something else..." option */}
											{lodash.get(this.state.selectedIssue, "value") ===
												lodash.last(this.issueSuggestions).value && (
												<div
													className={
														"row section collapsible " +
														(this.readyForProblemOverview() ? "" : "collapsed")
													}
												>
													<label>
														Problem not listed? No problem. Just give us a brief overview.
													</label>
													<input
														className="fullWidth"
														defaultValue={this.state.problemOverview}
														value={this.state.problemOverview}
														onChange={event =>
															this.setState({ problemOverview: event.target.value })
														}
														placeholder="Problem overview"
														type="text"
													/>
												</div>
											)}

											{/* Description */}
											<div
												className={
													"row section collapsible " +
													(this.readyForDescription() ? "" : "collapsed")
												}
											>
												<label className="secondary-text">
													Describe the problem you're having as best as you can.
												</label>
												<textarea
													className="fullWidth"
													defaultValue={this.state.description}
													value={this.state.description}
													onChange={event =>
														this.setState({ description: event.target.value })
													}
													placeholder="Providing a clear, concise description of the problem you're having helps us to better help you. Be sure to provide any context you think could be relevant. We appreciate you taking the time."
												/>
												<this.fileDropZone />
												<div
													className={
														"row section text-right collapsible " +
														(this.readyForDoneEditing() ? "" : "collapsed")
													}
												>
													<Button
														variant="secondary"
														onClick={() =>
															this.setState({
																doneEditing: true
															})
														}
													>
														<span>Next</span>
														<FontAwesomeIcon name="caret-right" />
													</Button>
												</div>
											</div>
										</div>

										{/* Done Editing Display */}
										<div className={"collapsible " + (this.state.doneEditing ? "" : "collapsed")}>
											{/* Request Info */}
											<div className="row section">
												<div>
													<label className="tiny secondary-text">Name</label>
													<label>{this.state.firstName + " " + this.state.lastName}</label>
												</div>
												<div className="" style={{ marginTop: "1em" }}>
													<label className="tiny secondary-text">Issue</label>
													<label>{lodash.get(this.state.selectedIssue, "value")}</label>
												</div>
												{lodash.get(this.state.selectedIssue, "items") && (
													<div style={{ marginTop: "1em" }}>
														<label className="tiny secondary-text">
															{lodash.capitalize(
																lodash.get(this.state.selectedIssue, "itemLabel")
															)}
														</label>
														<label>{this.state.problemOverview}</label>
													</div>
												)}
												<div style={{ marginTop: "1em" }}>
													<label className="tiny secondary-text">Description</label>
													<label>{this.state.description}</label>
												</div>
												<this.showAttachmentFiles />																								
												<div className="row section text-center">
													<Button
														variant="secondary"
														onClick={() => this.setState({ doneEditing: false })}
													>
														<FontAwesomeIcon name="pencil" />
														<span>Edit Request</span>
													</Button>
												</div>
											</div>

											{/* Submit or Cancel */}
											<div
												className={
													"row collapsible " + (this.readyForSubmit() ? "" : "collapsed")
												}
											>
												<hr />

												<div className="flexed valign-wrapper">
													<div />

													<div>
														<Button variant="outline-danger" onClick={() => this.reset()}>
															Cancel
														</Button>

														<Button
															variant="success"
															disabled={!this.state.canSubmit ? "disabled" : ""}
															onClick={this.submitTicket}
														>
															{submitVerbiage}
														</Button>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>

							<div
								className={
									"modal-footer flexed valign-wrapper " +
									(this.state.requestingSupport && !this.state.doneEditing ? "" : "hidden")
								}
								style={{
									flexWrap: "wrap"
								}}
							>
								<span className="tiny secondary-text">All inputs are required.</span>

								{this.state.requestingSupport && (
									<span className="tiny secondary-text">
										{this.state.contactPreference === "phone" && !this.isAfterHours() && (
											<span className="tiny">
												Or call 866-294-4599 ext. 111 (M-F 8am - 4pm CST)
											</span>
										)}

										{this.state.contactPreference === "email" && (
											<span>A copy of this request will be emailed to you.</span>
										)}
									</span>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

window.lodash = _.noConflict()
document.addEventListener("DOMContentLoaded", function() {
	
	if (window.location.href.indexOf("/admin") > -1) return
	if (window.location.href.indexOf("/reports") > -1) return	
	
	var needHelpTriggers = document.getElementsByClassName("inline-need-help-trigger")

	for (let i = 0; i < needHelpTriggers.length; ++i) {
		needHelpTriggers[i].onclick = function() {			
			document.getElementById("customerSupportHelpButton").click()
		}
	}
	
	const contactUsDiv = document.createElement('div');
	contactUsDiv.setAttribute('id','contactUsContainer');
	document.body.appendChild(contactUsDiv);
	ReactDOM.render(
		<ContactUs />,
		contactUsDiv,
		function(){
			var lowercaseHref = window.location.href.toLowerCase();
			var searchString = "techsupport=1";
			if(lowercaseHref.includes(searchString)){
				document.getElementById("customerSupportHelpButton").click()
			}
		}
	)
});
