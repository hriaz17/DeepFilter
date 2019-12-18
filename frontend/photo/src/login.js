import React from 'react';
import './stylesheets/common.css';
import './stylesheets/login.css';

class Login extends React.Component{
    
    constructor(props){
        super(props);
        this.state = {
            username: window.localStorage.getItem('usr'),
            password: window.localStorage.getItem('psw'),
            remember: 0,
            token: window.localStorage.getItem('tkn'),
        }
        this.usernameChange = this.usernameChange.bind(this);
        this.passwordChange = this.passwordChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    checkRemember(e){
        if(this.state.remember !== 1){
            this.setState({remember: 1})
            window.localStorage.setItem('usr', this.state.username);
            window.localStorage.setItem('psw', this.state.password);
            window.localStorage.setItem('tkn',this.state.token);
        }else{
            this.setState({remember: 0})
            window.localStorage.removeItem('usr');
            window.localStorage.removeItem('psw');
            window.localStorage.removeItem('tkn');
        }
    }

    usernameChange(e){
        this.setState({
            username:e.target.value
        })
    }

    passwordChange(e){
        this.setState({
            password:e.target.value
        })
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        if(!this.state.username || !this.state.password){
            window.alert("Please provide username and password.");
            return;
        }
        let checkobj = {
            userid: this.state.username,
        }
        try{
            const response= await fetch('/checkLockout', {
                method: 'POST',
                body: JSON.stringify(checkobj), // string or object
                headers: {
                'Content-Type': 'application/json; charset=utf-8',
                },
            });   
            const res = await response.json();
            console.log('check'+res.data[0].failedcount);
            if (res.data[0].failedcount>=5){
                alert('The account has been locked out! Please contact us!');
                return;
            }
   
        } catch (error) {
            alert('Check Lockout ERROR');

        }

        let obj = {
            name: this.state.username,
            password: this.state.password
        }
        try{
            const response = await fetch('/login', {
                method: 'POST',
                body: JSON.stringify(obj), // string or object
                headers: {
                'Content-Type': 'application/json; charset=utf-8',
                },
            });   
            const res = await response.json();
            console.log('test',res);


            if (res.data.length === 1) {

                try{
                    const response2= await fetch('/successLogin', {
                        method: 'POST',
                        body: JSON.stringify(checkobj), // string or object
                        headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                        'authorization': 'Bearer' + this.state.token,
                        },
                    });   
                    await response2.json();
                }catch (error) {

                    alert('Login ERROR');
                }

                window.sessionStorage.setItem('cur_user', obj.name);
                window.location.href = '/profile';
 
            } else {
                try{
                const response2= await fetch('/failedLogin', {
                    method: 'POST',
                    body: JSON.stringify(checkobj), // string or object
                    headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    },
                });   
                await response2.json();
            }catch (error) {
                alert('Login ERROR');
            }

        
                alert('login failed.');
            }
        } catch (error) {
            alert('Login ERROR');
        }
    }
    
    render(){
        return (
            <div className="login-form">
                    <h3 id="login-heading">Sign in & Explore More</h3>     
                    <div>        
                        <div className="input-group login-input-bar">
                        <div className="input-group-prepend">
                            <span className="input-group-text"><i className="input-icon fas fa-user-circle fa-lg"></i></span>
                        </div>
                        <input type="text" className="form-control" id="username" placeholder="Username" aria-label="Username" aria-describedby="basic-addon1"
                            onChange={this.usernameChange} value={this.state.username}/>
                        </div>
        
                        <div className="input-group login-input-bar">
                        <div className="input-group-prepend">
                            <span className="input-group-text"><i className="input-icon fas fa-lock fa-lg"></i></span>
                        </div>
                        <input type="password" className="form-control" id="password" placeholder="Password" aria-label="Password" aria-describedby="basic-addon1"
                            onChange={this.passwordChange} value={this.state.password}/>
                        </div> 
                        
                        <div className="form-group">
                            <button className="btn btn-success btn-block signin-btn" onClick={this.handleSubmit}>Sign in</button>
                        </div>
                        <div className="clearfix">
                            <label className="checkbox-inline">
                                <input type="checkbox" onChange={this.checkRemember.bind(this)}/> Remember me
                            </label>
                        </div> 
                    </div>         
                
                    <div className="hint-text small">Don't have an account? <a href="/signup" className="text-success">Register Now!</a></div>
                </div>
          );
    }
}

export default Login;