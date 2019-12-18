import React from 'react';
import './stylesheets/common.css';
import './stylesheets/feed.css';
import './stylesheets/rec.css';


class Rec extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            user: window.sessionStorage.getItem('cur_user'),
            token: window.localStorage.getItem('tkn'),
            recList: [],
            imgList: [],
        }
    }

    componentDidMount(){
        this.getRec();
    }

    async getRec(){
        let user = this.state.user;
        let resList = [];
        try {
            const response = await fetch('/recommend/'+ user, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'authorization': 'Bearer' + this.state.token,
                },
            });
            const res = await response.json();
            for(let item of res.data){
                resList.push(item.followingid)
            }
            this.setState({recList: resList});
            this.getImgs();
        } catch (error) {
          alert('FETCH RECOMMENDATIONS ERROR');
        }
    }

    async getImgs(){
        let users = this.state.recList;
        let resList = [];
        for( let user of users){
            try {
                const response = await fetch('/profile/'+user, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                        'authorization': 'Bearer' + this.state.token,
                    },
                });
                const resp = await response.json();   
                resList.push(resp.data[0].imgurl);               
            } catch (error) {
                console.log("profile-img fetch failed: " + user);
            }
        }
        this.setState({ imgList: resList});
    }

    async followRec(id){
        let obj = {
            userid: window.sessionStorage.getItem('cur_user'),
            followingid: id,
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
            const res = await response.json();
            console.log(res);
            window.sessionStorage.setItem("lookup_user", id);
            window.location.href = './profile';
        } catch (error) {
            alert('ERROR: follow failed...');
        }
    }
       
    render(){
        let nameList = this.state.recList;
        let cardList = [];

        if(nameList.length === 0){
            cardList.push(
                <div className="card rec-card" key='else'>
                    <div className="card-body">
                        <h5 className="card-title" style={{color:"black"}}>No more recommendation now!</h5>
                        <button className="btn btn-primary">OK</button>
                    </div>
                </div>  
            );
        }

        let idx = 0;
        for(let name of nameList){
            cardList.push(
                <div className="card rec-card" key={name.trim()}>
                    <img className="card-img-top" alt="rec-user" src={this.state.imgList[idx++]} style={{height:"286px"}} />
                    <div className="card-body">
                        <h5 className="card-title" style={{color:"black"}}>{name.trim()}</h5>
                        <button className="btn btn-primary" onClick={() => { this.followRec(name) }}>Follow</button>
                    </div>
                </div>  
            );
        }

        return(
            <div>{cardList}</div>
        );
    }

}

export default Rec;