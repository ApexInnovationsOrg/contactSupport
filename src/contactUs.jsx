"use strict";

// import React from "react";
// import ReactDOM from "react-dom";
import styles from "./styles.scss";

class ContactUs extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			ticketType: "phone",
			canSubmit: false,
			problemOverview: "",
			description: "",
			emailAddress: "",
			phoneNumber: "",
			submitting: false,
			submitted: false
		};

		// this.handleChange = this.handleChange.bind(this);
	}

	updateTicketType(type) {
		this.setState({
			ticketType: type
		});
	}

	componentDidUpdate(prevProps, prevState) {
		// any type of request requires problem overview and description
		let canSubmit = this.state.problemOverview && this.state.description;

		switch (this.state.ticketType) {
			case "phone":
			default:
				// can submit phone request if phone number is provided
				canSubmit = canSubmit && this.state.phoneNumber;

			case "email":
				// can submit email request if email address is provided
				canSubmit = canSubmit && this.state.emailAddress;
		}

		// only update the can submit if the previous state was disabled
		if (prevState.canSubmit !== canSubmit) {
			this.setState({ canSubmit: canSubmit });
		}
	}

	submitTicket = () => {
		console.log("submitting ticket");
		this.setState({
			submitting: true,
			canSubmit: false
		});
		let opts;
		if (this.state.ticketType == "email") {
			opts = {
				ticketType: this.state.ticketType,
				contactInfo: this.state.emailAddress,
				problemOverview: this.state.problemOverview,
				description: this.state.description
			};
		}

		if (this.state.ticketType == "phone") {
			opts = {
				ticketType: this.state.ticketType,
				contactInfo: this.state.phoneNumber,
				problemOverview: this.state.problemOverview,
				description: this.state.description
			};
		}

		fetch("/admin/techSupport/submitTicket", {
			method: "POST",
			body: JSON.stringify(opts)
		})
			.then(response => {
				return response.json();
			})
			.then(data => {
				console.log(data);
			});
	};

	submitText() {
		if (this.state.submitting) {
			return <span>Submitting...</span>;
		}

		if (this.state.submitted) {
			return <span>Submitted!</span>;
		}

		return <span>Submit</span>;
	}

	render() {
		let submitVerbiage = this.submitText();

		return (
			<div
				style={{
					margin: "1em",
					fontSize: "2em"
				}}
			>
				<div>
					<button type="button" className="close" data-dismiss="modal">
						&times;
					</button>
					<h2
						style={{
							color: "#436194"
						}}
					>
						Customer/Technical Support
					</h2>
					{/* <ul
						className="nav nav-tabs"
						id="tabContent"
						style={{
							paddingLeft: "1em"
						}}
					>
						<li className="active" onClick={() => this.setState({ ticketType: "phone" })}>
							<a href="#phone" data-toggle="tab">
								<i className="fa fa-phone" /> Call me
							</a>
						</li>
						<li>
							<a href="#email" onClick={() => this.setState({ ticketType: "email" })} data-toggle="tab">
								<i className="fa fa-envelope" /> Email
							</a>
						</li>
					</ul> */}
				</div>
				<div className="modal-body">
					<h3>Need assistance? No problem. Just let us know what you're having trouble with.</h3>

					<div className="row" style={{ paddingTop: "1em" }}>
						<div className="${styles.vertical-align}">
							<label>
								<label>
									Problem Overview <span className="required_indicator">(Required)</span>
								</label>
							</label>
						</div>
						<div>
							<input
								style={{ background: "#f8f8ff", width: "100%" }}
								value={this.state.problemOverview}
								onChange={() => this.setState({ problemOverview: event.target.value })}
								placeholder="Problem overview"
								type="text"
							/>
						</div>
					</div>
					<div className="row" style={{ paddingTop: "1em" }}>
						<div className="row">
							<label>
								Description <span className="required_indicator">(Required)</span>
							</label>
						</div>
						<div className="row">
							<div
								contentEditable="true"
								style={{
									width: "100%",
									minHeight: "200px",
									border: "1px solid black",
									padding: ".5em",
									background: "#f8f8ff"
								}}
								value={this.state.description}
								onChange={() => this.setState({ description: event.target.value })}
								placeholder="Describe the issue you'd like help with. What exactly are you trying to do? What's happening instead?"
							/>
						</div>
					</div>
					<div style={{ paddingTop: "1em" }}>
						<div className="row">
							<label>
								Phone Number <span className="required_indicator">(Required)</span>
							</label>
						</div>
						<div className="row">
							<input
								style={{ background: "#f8f8ff" }}
								type="tel"
								pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
								required
								value={this.state.phoneNumber}
								onChange={() => this.setState({ phoneNumber: event.target.value })}
								placeholder="(xxx) xxx-xxxx"
							/>
						</div>
					</div>
					<div style={{ paddingTop: "1em" }}>
						<label>
							Email <span className="required_indicator">(Required)</span>
						</label>
						<div className="row">
							<input
								style={{ background: "#f8f8ff" }}
								type="email"
								placeholder="user@domain.com"
								value={this.state.emailAddress}
								onChange={() => this.setState({ emailAddress: event.target.value })}
							/>
						</div>
					</div>
				</div>
				<div className="modal-footer">
					<button
						type="button"
						className="btn btn-success"
						disabled={!this.state.canSubmit ? "disabled" : ""}
						onClick={this.submitTicket}
					>
						{submitVerbiage}
					</button>
					<button type="button" className="btn btn-default" data-dismiss="modal">
						Close
					</button>
				</div>
			</div>
		);
	}
}

ReactDOM.render(<ContactUs />, document.getElementById("innerModal"));
