import React from 'react';
import './stylesheets/common.css';
import './stylesheets/profile.css';

class Profile extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            user: window.sessionStorage.getItem('cur_user'),
            lookup: window.sessionStorage.getItem('lookup_user'),
            isFollowing: 0,
            email:'',
            imgurl:'',
            photos: new Map(),
            search: '',
        }
        this.searchChange = this.searchChange.bind(this);
        this.searchSubmit = this.searchSubmit.bind(this);
    }

    componentDidMount(){
        let lookup_user = window.sessionStorage.getItem("lookup_user");
        let login_user = window.sessionStorage.getItem("cur_user");
        if(!lookup_user) this.updateInfo(login_user);
        else {
            this.updateInfo(lookup_user);
            this.isFollowing();
        }
        // clear sessiom storage, so there will be no confusion next time opening profile :
        window.sessionStorage.removeItem('lookup_user');
    }


    async updateInfo(user){
        try {
            const response = await fetch('/profile/'+user, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'authorization': 'Bearer' + this.state.token,
                },
            });
            const resp = await response.json();

            this.setState({ user: resp.data[0].name});
            this.setState({ email: resp.data[0].email});
            this.setState({ imgurl: resp.data[0].imgurl});
        } catch (error) {
            alert('Profile Search ERROR: No such user!');
            this.toFeeds();
            return;
        }
      
        // user photo collection
        try {
            const response = await fetch('/profile/userimg/'+user, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'authorization': 'Bearer' + this.state.token,
                },
            });
            const res = await response.json();
            let map = new Map();
            for (let i = 0; i < res.data.length; i++) {
               map.set(res.data[i].imgid, res.data[i].imgurl);
            }
            this.setState({photos: map});
            console.log(this.state.photos); 
        } catch (error) {
          alert('FETCH PHOTOS ERROR');
        }
    }


    async isFollowing(){
        //check if following this user now.
        let obj = {
            userid: this.state.user,
            followingid: this.state.lookup,
        }
        try{
            const response = await fetch('/profile/checkfollow', {
                method: 'POST',
                body: JSON.stringify(obj), // string or object
                headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'authorization': 'Bearer' + this.state.token,
                },
            });   
            const res = await response.json();
            this.setState({isFollowing: res.data[0].count});
            console.log("Following status set: " + this.state.isFollowing);
        } catch (error) {
            alert('Fetch following status ERROR');
        }
    }

    async foRequest(){
        let obj = {
            userid: window.sessionStorage.getItem('cur_user'),
            followingid: this.state.lookup,
        }
        try{
            const response = await fetch('/feeds/follow', {
                method: 'POST',
                body: JSON.stringify(obj), // string or object
                headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'authorization': 'Bearer' + this.state.token,
                },
            });   
            response.json();
            this.setState({isFollowing: '1'});
        } catch (error) {
          alert('ERROR: follow failed...');
        }
    }

    async unfoReq(){
        let obj = {
            userid: window.sessionStorage.getItem('cur_user'),
            followingid: this.state.lookup,
        }
        try{
            const response = await fetch('/feeds/unfollow', {
                method: 'POST',
                body: JSON.stringify(obj), // string or object
                headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'authorization': 'Bearer' + this.state.token,
                },
            });   
            const res = await response.json();
            console.log(res);
            this.setState({isFollowing: '0'});
        } catch (error) {
          alert('ERROR: unfollow failed...');
        }
    }

    searchChange(e){
        this.setState({
            search:e.target.value
        })
    }

    async searchSubmit(e){
        e.preventDefault();
        // goto profile page, pass following-id.
        window.sessionStorage.setItem("lookup_user", this.state.search);
        window.location.href = './profile';
    }

    async delImg(imgid){
        let obj = {
            imgid: imgid,      
            userid: window.sessionStorage.getItem('cur_user'),
        };
        try{
            const response = await fetch('/profile/images/delete', {
                method: 'DELETE',
                body: JSON.stringify(obj), // string or object
                headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'authorization': 'Bearer' + this.state.token,
                },
            });   
            response.json();
            alert("Successfully deleted photo!");
            this.refreshToMine(); 
        } catch (error) {
            console.log('delete post failed');
        }  
    }

    refreshToMine(){
        window.location.href = './profile';
    }
  
    toUpload(){
        window.location.href = '/upload';
    } 

    toFeeds(){
        window.location.href = '/';
    }
   
    render(){
      let photoList = [];
      let allowDelete;
      let myMap = this.state.photos;

      for (const [k, v] of myMap.entries()) {
        if(this.state.lookup == null){
            allowDelete = (
              <button className="hover-btn" alt="remove post" onClick={() => {this.delImg(k)}}>
              <i className="fas fa-times"></i>
              </button>
            )
        }
        photoList.push(
          <div className="photo-in-collage" key={k}>
            <img className="gallery-img" src={v} alt="" width="200" height="200" />
            {allowDelete}
          </div>
        ) 
      } 

      let conditionalButton;
      if(this.state.lookup != null){
            if(this.state.isFollowing === '0'){
                conditionalButton = <button className="profile-btn" onClick={this.foRequest.bind(this)}>Follow</button>
            }else{
                conditionalButton = <button className="profile-btn" onClick={this.unfoReq.bind(this)}>Unfollow</button>
            }        
      }else{
            conditionalButton = <button className="btn btn-success btn-block" onClick={this.toUpload}>Upload</button>
      }
      
      return (
        <div>                
            <nav>
            <form className="form-inline" style={{marginTop:"30px"}}>
                <input className="form-control mr-sm-2" type="search" placeholder="Looking For Other Users?" aria-label="Search" 
                    onChange={this.searchChange} value={this.state.search} style={{width:"500px", marginLeft:"300px"}} />
                <button className="btn btn-primary my-2 my-sm-0" type="submit"
                    onClick={this.searchSubmit}>Search Profile</button>
                <button className="btn btn-success" type="button" 
                    onClick={this.refreshToMine} style={{marginLeft:"10px"}}>My Profile</button>
                <button id="to-feed-btn" className="btn btn-warning" type="button" 
                    onClick={this.toFeeds}>Go Check Latest Feeds!</button>
            </form>
            </nav>
            <div className="profile row">
                <div className="profile-card col-sm=6">
                    <img src={this.state.imgurl} alt="profile-img" style={{width:"150px", height: "150px"}}/>                    
                    <h1 id="username"> {this.state.user} </h1>  
                    <div className = "infoBox" id = "followers">
                        Posts: <b>{this.state.photos.size}</b>  
                    </div>
                    <p className="profile-title" id="email">{this.state.email}</p>
                    <p> Welcome! This is {this.state.lookup ? this.state.lookup : this.state.user}'s profile!</p>                   
                    <div style={{width:"60%",margin:"auto"}}>
                        {conditionalButton}
                    </div>
                </div>
                <div className="photo-collage col-sm-6">{photoList}</div>
            </div>
        </div>
      );
    }
}

export default Profile;