'use strict';

const e = React.createElement;

class ContactUs extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      ticketType:'phone',
      canSubmit:false,
      problemOverviewEmail:'',
      descriptionEmail:'', 
      emailAddress:'',
      problemOverviewPhone:'',
      descriptionPhone:'',
      phoneNumber:'',
      submitting:false,
      submitted:false
    };

    // this.handleChange = this.handleChange.bind(this);
  }

  updateTicketType(type)
  {
    this.setState({
      ticketType: type
    })
  }

  componentDidUpdate(prevProps,prevState) {

    if(this.state.ticketType === 'phone')
    {
      if(this.state.problemOverviewPhone !== '' && this.state.descriptionPhone !== '' && this.state.phoneNumber !== '')
      {
        if(!prevState.canSubmit)
        { 
          this.setState({ canSubmit: true}); 
        }
        
      }
      else
      {
        if(prevState.canSubmit)
        { 
          this.setState({ canSubmit: false}); 
        }
      }

    }
    if(this.state.ticketType === 'email')
    {

      if(this.state.problemOverviewEmail !== '' && this.state.descriptionEmail !== '' && this.state.emailAddress !== '')
      {
        if(!prevState.canSubmit)
        { 
          this.setState({ canSubmit: true}); 
        }
        
      }
      else
      {
        if(prevState.canSubmit)
        { 
          this.setState({ canSubmit: false}); 
        }
      }

    }    
  }
  
  submitTicket = () => 
  {
    console.log('submitting ticket');
    this.setState({
      submitting:true,
      canSubmit:false
    });
    let opts;
    if(this.state.ticketType == 'email')
    {
      opts = {
        ticketType:this.state.ticketType,
        contactInfo:this.state.emailAddress,
        problemOverview:this.state.problemOverviewEmail,
        description:this.state.descriptionEmail,
      }
    }

    if(this.state.ticketType == 'phone')
    {
      opts = {
        ticketType:this.state.ticketType,
        contactInfo:this.state.phoneNumber,
        problemOverview:this.state.problemOverviewPhone,
        description:this.state.descriptionPhone,
      }
    }

    fetch("/admin/techSupport/submitTicket",{
      method:'POST',
      body:JSON.stringify(opts)
    }).then(function(response){
      return response.json();
    }).then(function(data){
      console.log(data);
    })

    
  }
  submitText(){


    if(this.state.submitting)
    {
      return <span>Submitting...</span>;
    }

    if(this.state.submitted)
    {
      return <span>Submitted!</span>;
    }
    
    return <span>Submit</span>;
  }

  render() {

    let submitVerbage = this.submitText();

return (
      <div style={{
        'font-size': 2 + 'em'
      }}>
          <div>
              <button type="button" className="close" data-dismiss="modal">&times;</button>
              <h3 style={{
                'marginLeft':'1em'
              }}>Customer/Technical Support</h3>
              <ul className="nav nav-tabs" id="tabContent" style={{
                'paddingLeft':'1em'
              }}>
                  <li className="active" onClick={() => this.setState({ ticketType: 'phone' })}><a href="#phone" data-toggle="tab"><i className="fa fa-phone"></i> Call me</a></li>
                  <li><a href="#email" onClick={() => this.setState({ ticketType: 'email' })} data-toggle="tab"><i className="fa fa-envelope"></i> Email</a></li>
              </ul>
          </div>
          <div className="modal-body">
              <div className="tab-content">
                  <div className="tab-pane active"  onClick={() => this.setState({ ticketType: 'phone' })}  id="phone"> 
                      <div>
                        <div>
                          <div className="row">
                            <div className="col-md-2 col-md-offset-1 md-margin-bot profilePicContainer"><img className="profilePic" src="images/KatieAnders.jpg"/></div>
                            <div className="col-md-6 md-pad-top" style={{'marginTop':'3em'}}>
                              <p>We'll call you</p>
                              <p>within the next five minutes</p>
                            </div>
                          </div>
                        </div>
                        <div className="row" style={{'paddingTop':'1em'}}>
                          <div>
                            <label>Problem overview *</label>
                          </div>
                          <div>
                            <input style={{background:'#f8f8ff',width:'100%'}} value={this.state.problemOverviewPhone} onChange={() => this.setState({problemOverviewPhone: event.target.value})} placeholder="Problem overview" type="text"></input>
                          </div>
                        </div>
                        <div className="row" style={{'paddingTop':'1em'}}>
                          <div className="row">
                            
                            <label>Description *</label>
                          </div>
                          <div className="row" >
                          <div contentEditable="true" style={{
                            width:'100%',
                            'min-height':'200px',
                            border:'1px solid black',
                            padding:'.5em',
                            background:'#f8f8ff'
                          }} value={this.state.descriptionPhone} onChange={() => this.setState({descriptionPhone: event.target.value})} placeholder="Describe the issue you'd like help with. What exactly are you trying to do? What's happening instead?">
                            
                          </div>
                          </div>
                        </div>
                        <div style={{'paddingTop':'1em'}}>
                          <div class="row">
                          <label>Phone number *</label>
                          </div>
                          <div class="row">
                          <input style={{background:'#f8f8ff'}} type="tel"
                              pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                              required
                              value={this.state.phoneNumber}
                              onChange={() => this.setState({phoneNumber: event.target.value})}
                              placeholder="(xxx) xxx-xxxx"  />

                          </div>
                        </div>
                      </div>
                      
                  </div>
                  <div className="tab-pane" onClick={() => this.setState({ ticketType: 'email' })}  id="email">
                   <div>
                        <div>
                          <div className="row" >
                            <div className="col-md-2 col-md-offset-1 md-margin-bot profilePicContainer"><img className="profilePic" src="images/MikeRubio.jpg"/></div>
                            <div className="col-md-6 md-pad-top"  style={{'marginTop':'3em'}}>
                              <p>We'll email you</p>
                              <p>within one working day</p>
                            </div>
                          </div>
                        </div>
                        <div className="row" style={{'paddingTop':'1em'}}>
                          <label>Problem overview *</label>
                          <input style={{background:'#f8f8ff',width:'100%'}}  type="text" value={this.state.problemOverviewEmail} onChange={() => this.setState({problemOverviewEmail: event.target.value})}></input>
                        </div>
                        <div  style={{'paddingTop':'1em'}}>
                          <label>Description *</label>
                          <div contentEditable="true" style={{
                            width:'100%',
                            'min-height':'200px',
                            border:'1px solid black',
                            padding:'.5em',
                            background:'#f8f8ff'
                          }}  value={this.state.descriptionEmail} onChange={() => this.setState({descriptionEmail: event.target.value})} placeholder="Describe the issue you'd like help with. What exactly are you trying to do? What's happening instead?">
                            
                          </div>
                        </div>
                        <div style={{'paddingTop':'1em'}}>
                          <label>Email *</label>
                          <div class="row">
                            <input style={{background:'#f8f8ff'}} type='email' placeholder="user@domain.com" value={this.state.emailAddress} onChange={() => this.setState({emailAddress: event.target.value})} ></input>
                          </div>
                        </div>
                      </div>
                  </div>
              </div>
          </div>
          <div className="modal-footer">

              <button type="button" className="btn btn-success" disabled={(!this.state.canSubmit) ? "disabled" : ""} onClick={this.submitTicket}>
              {submitVerbage}
              </button>
              <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
          </div>
      </div>
    );
  }
}


const domContainer = document.querySelector('#innerModal');
ReactDOM.render(e(ContactUs), domContainer);