import React from 'react';
import './stylesheets/common.css';
import './stylesheets/signup.css';

class Signup extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            email:'',
            username:'',
            password:'',
            passwordCfm:''
        }
        this.emailChange = this.emailChange.bind(this);
        this.usernameChange = this.usernameChange.bind(this);
        this.passwordChange = this.passwordChange.bind(this);
        this.passwordCfmChange = this.passwordCfmChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    usernameChange(e){
        this.setState({
            username:e.target.value
        })
    }
    emailChange(e){
        this.setState({
            email:e.target.value
        })
    }
    passwordChange(e){
        this.setState({
            password:e.target.value
        })
    }
    passwordCfmChange(e){
        this.setState({
            passwordCfm:e.target.value
        })
    }

    handleSubmit(e){
        e.preventDefault();
        let username = this.state.username;
        let email = this.state.email;
        let password = this.state.password;
        let passwordCfm = this.state.passwordCfm;

        if(username.length>20){
            alert('UserId should shorter than 20 characters!');
            return;
        }
        
        if(password.length<6){
            alert('Please enter password no shorter than 6 characters!');
            return;
        }

        if(!email.includes('@')){
            alert('Please enter valid email address!');
            return;
        }

        if(!username || !email || !password ){
            alert('Your must fill all fields to register!');
            return;
        }
        if(password !== passwordCfm) {
            alert('Your re-entered password does not match previous one!');
            return;
        }
        const objp = {
            name: username,
            email,
            imgurl: 'http://tigernewspaper.com/wp-content/uploads/2015/07/minions.jpg', // default img
        };
        
        const obj = {
            name: username,
            email,
            password,
        };
        this.createProfile(objp);
        this.createAccount(obj);
    }
    
    
    async createProfile(objp) {
        const response = fetch('/profile/', {
        method: 'POST',
        body: JSON.stringify(objp), // string or object
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            },
        });
        //console.log(response.json());
        
        //alert("Try another username!");
      }
      
    async createAccount(obj) {
        const response = await fetch('/account/', {
            method: 'POST',
            body: JSON.stringify(obj), // string or object
            headers: {
            'Content-Type': 'application/json; charset=utf-8',
            },
        });
        //window.location.href = '/login';
    }

    signupSubmit() {
        const email = document.getElementById('email').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const passwordCfm = document.getElementById('password-cfm').value;
      
        if (password !== passwordCfm) {
          alert('Your re-entered password does not match previous one!');
          return;
        }
      
        const objp = {
          name: username,
          email,
          imgurl: 'http://tigernewspaper.com/wp-content/uploads/2015/07/minions.jpg',
        };
      
        const obj = {
          name: username,
          email,
          password,
        };
        this.createProfile(objp);
        this.createAccount(obj);   
    }

    
    
    
    render(){
        return (
            <div className="signup-form">
                <i className="header-icon far fa-user-circle fa-3x"></i>
                <h2 className="card-title mt-3 text-center" style={{fontWeight: "bold"}}>Create Account</h2>
                <p className="text-center">Get started with your account at DeepFilter.ai</p>
                <form>
                    <div className="form-group input-group">
                    <div className="input-group-prepend">
                        <span className="input-group-text"> <i className="fa fa-user"></i> </span>
                    </div>
                    <input id="username" className="form-control signup-input-bar" placeholder=" Pick your username" type="text"
                        onChange={this.usernameChange} value={this.state.username} />
                    </div> 
                    
                    <div className="form-group input-group">
                    <div className="input-group-prepend">
                        <span className="input-group-text"> <i className="fa fa-envelope"></i> </span>
                    </div>
                    <input id="email" className="form-control signup-input-bar" placeholder=" Provide your email address" type="email"
                        onChange={this.emailChange} value={this.state.email} />
                    </div> 
                    
                    <div className="form-group input-group">
                    <div className="input-group-prepend">
                        <span className="input-group-text"> <i className="fa fa-lock"></i> </span>
                    </div>
                    <input id="password" className="form-control signup-input-bar" placeholder=" Create password" type="password"
                        onChange={this.passwordChange} value={this.state.password} />
                    </div> 
                    
                    <div className="form-group input-group">
                    <div className="input-group-prepend">
                        <span className="input-group-text"> <i className="fa fa-key"></i> </span>
                    </div>
                    <input id="password-cfm" className="form-control signup-input-bar" placeholder=" Confirm password" type="password"
                        onChange={this.passwordCfmChange} value={this.state.passwordCfm} />
                    </div>                                       
                    
                    <div className="form-group">
                        <button type="submit" id="submit-btn" className="btn btn-success btn-block" onClick={this.handleSubmit}> Create Account </button>
                    </div>      
                
                    <p className="text-center">Already got an account? Please <a href="/login" className="text-success">Log In</a> </p>
                </form>
            </div> 
          );
    }
}

export default Signup;