"use strict";

// import React from "react";
// import ReactDOM from "react-dom";
import MaskedInput from "react-maskedinput";
import "./styles.scss";

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
				break;

			case "email":
				// can submit email request if email address is provided
				canSubmit = canSubmit && this.state.emailAddress;
				break;
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

		let options = {
			ticketType: this.state.ticketType,
			problemOverview: this.state.problemOverview,
			description: this.state.description
		};

		switch (this.state.ticketType) {
			case "phone":
			default:
				options.contactInfo = this.state.phoneNumber;
				break;

			case "email":
				options.contactInfo = this.state.emailAddress;
				break;
		}

		fetch("/admin/techSupport/submitTicket", {
			method: "POST",
			body: JSON.stringify(options)
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
				className="contactUsContainer"
				style={{
					margin: "1em",
					fontSize: "2em"
				}}
			>
				<div>
					<button type="button" className="fa-lg close" data-dismiss="modal">
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
					<div className="problemSelectionContainer">
						<h3>Need assistance? No problem. Just let us know what you're having trouble with.</h3>
						<div className="problemSelection">
							<button>
								<i className="fa fa-archive" />
								Products
							</button>
							<button>
								<i className="fa fa-user" />
								Account
							</button>
							<button>
								<i className="fa fa-question" />
								Something Else
							</button>
						</div>
					</div>

					{/* <div className="row section">
						<label>Problem Overview</label>
						<input
							className="fullWidth"
							value={this.state.problemOverview}
							onChange={() => this.setState({ problemOverview: event.target.value })}
							placeholder="Problem overview"
							type="text"
						/>
					</div> */}
					<div className="row section">
						<label>Describe the problem you're having as best as you can.</label>
						<textarea
							className="fullWidth"
							value={this.state.description}
							onChange={() => this.setState({ description: event.target.value })}
							placeholder="Describe the issue you'd like help with. What exactly are you trying to do? What's happening instead?"
						/>
					</div>
					<div className="row section text-center">
						<hr />
						<label>How would you like to be contacted?</label>
						<div className="row">
							<i
								className={
									"fa fa-phone contactSelection " +
									(this.state.ticketType === "phone" ? "selected" : "")
								}
								onClick={() => this.setState({ ticketType: "phone" })}
							/>
							<i
								className={
									"fa fa-envelope contactSelection " +
									(this.state.ticketType === "email" ? "selected" : "")
								}
								onClick={() => this.setState({ ticketType: "email" })}
							/>
						</div>
						<div className="row section">
							<label className="tiny">
								{"Please provide a " +
									(this.state.ticketType === "phone" ? "phone number" : "email address") +
									" where we can reach you."}
							</label>
							<MaskedInput
								className={this.state.ticketType === "phone" ? "" : "hidden"}
								id="phoneInput"
								mask="(111) 111-1111"
								type="tel"
								pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
								required
								value={this.state.phoneNumber}
								onChange={() => this.setState({ phoneNumber: event.target.value })}
								placeholder="(555) 555-5555"
							/>
							<input
								className={this.state.ticketType === "email" ? "" : "hidden"}
								id="emailInput"
								type="email"
								placeholder="janedoe@gmail.com"
								required
								value={this.state.emailAddress}
								onChange={() => this.setState({ emailAddress: event.target.value })}
							/>
						</div>
					</div>
				</div>
				<div className="modal-footer">
					<span className="tiny">All inputs are required.</span>
					<div>
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
			</div>
		);
	}
}

ReactDOM.render(<ContactUs />, document.getElementById("innerModal"));
