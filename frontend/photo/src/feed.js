import React from 'react';
import Rec from './rec';
import './stylesheets/common.css';
import './stylesheets/feed.css';


class Feed extends React.Component{
    
    constructor(props){
        super(props);
        this.state = {
            user: window.sessionStorage.getItem('cur_user'),
            cards: [], 
            search: '',
            newCommentText: '',
            liked: new Set(),
            likeCount: new Map(),
        }
        this.searchChange = this.searchChange.bind(this);
        this.searchSubmit = this.searchSubmit.bind(this);
        this.newComment = this.newComment.bind(this);
        this.addComment = this.addComment.bind(this);
    }

    componentDidMount(){
        this.updateInfo();
    }

    async updateInfo(){
        let obj = {
            userid: this.state.user,
        }
        try{
            const response = await fetch('/feeds/allimages', {
                method: 'POST',
                body: JSON.stringify(obj), // string or object
                headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'authorization': 'Bearer' + this.state.token,
                },
            });   
            const res = await response.json();
            console.log(res);
            let cardList = [];
            if (res.data.length > 0) {
                for(let i = 0; i< res.data.length; i++){
                    cardList.push(res.data[i]);
                }
                this.setState({cards: cardList});  
                // put values in local to live update like status
                this.getLikedList();
                this.getLikeCount();
            } else {
                alert('no posts available.');
            }
        } catch (error) {
            console.log('refresh feed ERROR. login first!');
        }
    }
    
    toLogin(){
        window.location.href = '/login';
    }

    toProfile(){
        if(! window.sessionStorage.getItem('cur_user')){
            alert("Please login first!");
            return;
        }
        window.location.href = './profile';
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

    toUserProfile(user){
        window.sessionStorage.setItem("lookup_user", user);
        window.location.href = './profile';
    }

    getLikeCount(){
        let cards = this.state.cards;
        let map = this.state.likeCount;
        for (let card of cards){
            map.set(card.imgid, parseInt(card.like));
        }
        console.log(this.state.likeCount);
    }

    getLikedList(){
        let cards = this.state.cards;
        for (let card of cards){
            this.isLiked(card.imgid);
        }
        console.log(this.state.liked);
    }

    async isLiked(imgid){
        let obj = {
            userid: this.state.user,
            imgid: imgid,
        }
        try{
            const response = await fetch('/image/checklike', {
                method: 'POST',
                body: JSON.stringify(obj), // string or object
                headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'authorization': 'Bearer' + this.state.token,
                },
            });   
            const res = await response.json();
            
            let set = this.state.liked;
            if(res.data[0].count === '1'){
                set.add(imgid);
            }
            this.setState({liked: set});
        } catch (error) {
            console.log('Like query request failed.');
        }  
    }

    async addLike(id){
        let obj = {
            userid: window.sessionStorage.getItem('cur_user'),
            imgid: id,
        };
        try{
            const response = await fetch('/image/like', {
                method: 'POST',
                body: JSON.stringify(obj), // string or object
                headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'authorization': 'Bearer' + this.state.token,
                },
            });   
            const res = await response.json();
            console.log(res);

            // reset state to update view
            let likedSet = this.state.liked;
            likedSet.add(id);
            this.setState({liked: likedSet})
            this.likeCountUpdate(id, 1);
        } catch (error) {
            console.log('Like request failed.');
        }   
    }

    async unlike(id){
        let obj = {
            userid: window.sessionStorage.getItem('cur_user'),
            imgid: id,
        };
        try{
            const response = await fetch('/image/unlike', {
                method: 'POST',
                body: JSON.stringify(obj), // string or object
                headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'authorization': 'Bearer' + this.state.token,
                },
            });   
            const res = await response.json();
            console.log(res);
            
            // reset state to update view
            let likedSet = this.state.liked;
            likedSet.delete(id);
            this.setState({liked: likedSet})
            this.likeCountUpdate(id, -1);
        } catch (error) {
            console.log('Unlike request failed.');
        }   
    }

    // This is only for front-end display use before refreshing page
    likeCountUpdate(imgid, change){
        let map = this.state.likeCount;
        let base = map.get(imgid);
        map.set(imgid, base + change);
        this.setState({likeCount: map});
    }

    newComment(e){
        this.setState({
            newCommentText:e.target.value 
        })
    }

    async addComment(imgid){
        if(this.state.newCommentText === ''){
            alert("your comment should not be empty!");
            return;
        }
        let obj = {
            userid: window.sessionStorage.getItem('cur_user'),
            imgid: imgid,
            comment: this.state.newCommentText,
        };
        try{
            const response = await fetch('/profile/images/comment', {
                method: 'POST',
                body: JSON.stringify(obj), // string or object
                headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'authorization': 'Bearer' + this.state.token,
                },
            });   
            const res = await response.json();
            console.log(res);
            this.setState({newCommentText: ''});
            window.location.href = '/'; 
        } catch (error) {
            console.log('Comment request failed');
        }      
    }

    async delComment(commentid){
        let obj = {
            commentid: commentid,       
        };
        try{
            const response = await fetch('/image/uncomment', {
                method: 'POST',
                body: JSON.stringify(obj), // string or object
                headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'authorization': 'Bearer' + this.state.token,
                },
            });   
            const res = await response.json();
            console.log(res);
            window.location.href = '/'; 
        } catch (error) {
            console.log('Uncomment request failed');
        }  
    }

    async delPost(id){
        let obj = {
            imgid: id,      
            userid: this.state.user, 
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
            const res = await response.json();
            console.log(res);
            window.location.href = '/'; 
        } catch (error) {
            console.log('delete post failed');
        }        
    }
    
    render(){   
        // loop to render photo cards
        let photoCardList = [];
        for (let card of this.state.cards) {
            // display comments
            let likeStatus;
            let commentList = [];

            for (let i = 0; i < card.comment.length; i++){
                let comment = card.comment[i];
                let commentText;
                if (comment.tag != null){
                    let tagged = comment.tag.trim();
                    let text = comment.comment;
                    let pre = text.substring(0, text.indexOf('@'));
                    let post = text.substring(text.indexOf(tagged) + tagged.length, text.length);
                    commentText = 
                    <p className="cmt-p">
                        {pre} 
                        <em className="tag-link" onClick={()=>{this.toUserProfile(tagged)}}>@{tagged}</em> 
                        {post} 
                    </p>
                }else{
                    commentText = <p className="cmt-p">{comment.comment}</p>
                }
                if(comment.userid.trim() === window.sessionStorage.getItem('cur_user') || card.followingid.trim() === window.sessionStorage.getItem('cur_user')){
                    commentList.push(
                        <li className="list-group-item" key={comment.commentid}>
                            <b>{comment.userid} : </b>{commentText}
                            <button className="uncomment-btn" 
                                onClick={()=>{this.delComment(comment.commentid)}}>
                                <i className="fas fa-trash-alt" ></i>
                            </button>
                        </li>
                    )
                }else{
                    commentList.push(
                        <li className="list-group-item" key={comment.commentid}>
                            <b>{comment.userid} : </b>{comment.comment}
                        </li>
                    )
                }
            }

            let likeNum = this.state.likeCount.get(card.imgid);
            //liked display
            if(this.state.liked.has(card.imgid)){
                likeStatus = (
                    <button className="card-btn" alt="unlike" onClick={() => {this.unlike(card.imgid)}}>
                        <i className="fas fa-heart liked-color"></i> {likeNum} liked
                    </button>
                )
            }//unlike display
            else{
                likeStatus = (
                <button className="card-btn" alt="like" onClick={() =>{this.addLike(card.imgid)}}>
                    <i className="fas fa-heart"></i> {likeNum} liked
                </button>
                );
            }

            // button to delete own post: only shown in cur)user's posts
            let deletePost;
            if(card.followingid.trim() === window.sessionStorage.getItem('cur_user')){
                deletePost = (
                    <button className="card-btn" alt="remove post" onClick={() => {this.delPost(card.imgid)}}>
                        <i className="fas fa-times"></i> Remove
                    </button>
                )
            }else{
                deletePost = <p></p>
            }

            // build card for this image
            let captionText;
            if (card.tag != null){
                let tagged = card.tag.trim();
                let text = card.caption;
                let pre = text.substring(0, text.indexOf('@'));
                let post = text.substring(text.indexOf(tagged) + tagged.length, text.length);
                captionText = 
                <p className="card-text">
                    {pre} 
                    <em className="tag-link" onClick={()=>{this.toUserProfile(tagged)}}>@{tagged}</em> 
                    {post} 
                </p>
            }else{
                captionText = <p className="card-text">{card.caption}</p>
            }
            photoCardList.push( // for loop iterate card, build JSX
                <div className="card photo-card" key={card.imgid}>
                    <img src={card.imgurl} className="card-img-top" alt={card.imgid} />
                    <div className="card-body">
                        <h5 className="card-title" 
                            onClick={()=>{this.toUserProfile(card.followingid)}}>{card.followingid}</h5>
                        {/* <p className="card-text">Photo description goes here.</p> */}
                        {captionText}
                    </div>
                    
                    <ul className="list-group list-group-flush">
                        {commentList}
                    </ul>

                    <div className="input-group mb-3  comment-div">
                        <input type="text" className="form-control" placeholder="What's on your mind?"
                            aria-label="Recipient's username" aria-describedby="button-addon2" 
                            onChange={this.newComment} value={this.state.newCommentText}/>
                        <div className="input-group-append">
                            <button className="btn btn-outline-info" type="button" 
                            id="button-addon2" onClick={() => { this.addComment(card.imgid) }}>Add Comment</button>
                        </div>
                    </div>

                    <div className="card-body" id="like-comment">
                        {likeStatus}
                        <button className="card-btn" alt="comment">
                            <i className="far fa-comment"></i> {card.comment.length} comments
                        </button>
                        {deletePost}
                    </div>
                </div>
            )
        } 

        // login check and msg display
        let loginDisplay = null;
        let loginStatus = null;
        if(this.state.user == null){
            loginDisplay = (
                <p style={{fontSize:"1.5rem",margin:"50px 0 0 435px"}}>Please log in to browse latest feeds!</p>
            )
            loginStatus = <span>Login</span>
        }else{
            loginDisplay = (
            <div className="row">   
                <div className="col-sm-8">{photoCardList}</div>
                <div className="col-sm-4">
                    <Rec/>
                </div>
            </div>
            )
            loginStatus = <span>Logout / Change Account</span> 
        }

        return(
        <div className="feed-div">
            <nav>
            <form className="form-inline" style={{marginTop:"30px"}}>
                <input className="form-control mr-sm-2" type="search" placeholder="Search User / HashTag" aria-label="Search" 
                    onChange={this.searchChange} value={this.state.search} style={{width:"500px", marginLeft:"300px"}} />
                <button className="btn btn-primary my-2 my-sm-0" type="submit"
                    onClick={this.searchSubmit}>Search</button>
                <button id="login-btn" className="btn btn-success my-2 my-sm-0" type="button"
                    onClick={this.toLogin}>{loginStatus}</button>
                <button id="to-profile-btn" className="btn btn-warning my-2 my-sm-0" type="button"
                    onClick={this.toProfile}>My Profile</button>
            </form>
            </nav>
            
            <div className="feed-heading">
                <h1><em>Welcome to PhotoSharing !</em></h1>
            </div>
            <div>{loginDisplay}</div>
        </div>
        );
    }
}

export default Feed;