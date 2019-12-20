import React from 'react';
import './stylesheets/common.css';
import './stylesheets/upload.css';

//import OutputImage from "./public/fast/output.jpg";

//const deepai = require('deepai');

var mainPath;
var stylePath;

class Upload extends React.Component{
  constructor(props){
      super(props);
      this.state = {
          user: window.sessionStorage.getItem('cur_user'),
          preview: '',
          text: '',
      }

      this.previewClicked = this.previewClicked.bind(this);
      this.handleTextChange = this.handleTextChange.bind(this);
      this.sharePostSubmit = this.sharePostSubmit.bind(this);
      this.callAPI_Preview = this.callAPI_Preview.bind(this);
      this.handleMain = this.handleMain.bind(this);
      this.handleStyle = this.handleStyle.bind(this);
  }

  handleStyle(event){
    console.log(event.target.files[0]);
    const myStorage = window.localStorage;
    const { files } = event.target;
    const formData = new FormData();
    formData.append('myFile', files[0], files[0].name);
  
    fetch('/fastStyle_styleUpload', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        myStorage.currentPath = data.path;
      })
      .catch((error) => {
        console.error(error);
      });

      this.setState({
        preview: ""
      })
  }

  handleMain(event){
    console.log(event.target.files[0]);
    const myStorage = window.localStorage;
    const { files } = event.target;
    const formData = new FormData();
    formData.append('myFile', files[0], files[0].name);
  
    fetch('/fastStyle_mainUpload', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        myStorage.currentPath = data.path;
      })
      .catch((error) => {
        console.error(error);
      });

    this.setState({
      preview: ""
    })
  }

  handleImageUpload(){
    const myStorage = window.localStorage;
    const { files } = "/fast/output.jpg";
    const formData = new FormData();
    formData.append('myFile', files[0], files[0].name);
  
    fetch('/saveImage', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        myStorage.currentPath = data.path;
      })
      .catch((error) => {
        console.error(error);
      });
  }

  handleTextChange(event){
      this.setState({text: event.target.value});
  }  
  
  async sharePostSubmit(){
    const myStorage = window.localStorage;
    const username = window.sessionStorage.getItem('cur_user');
    const imgpath = '/fast/output.jpg';
    const req = {
      userid: username,
      imgurl: imgpath,
      text: this.state.text,
    }

    

    // alert(this.state.text);
  
    const response = await fetch('/profile/images', {
      method: 'POST',
      body: JSON.stringify(req), // string or object
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const resp = await response.json();
    console.log(resp);
    window.location.href = '/profile';
  }

  //deepai.setApiKey('78a13c71-5827-4524-9f7b-3d24575a06e1');
  async callAPI(event){
    console.log(event);
  
    fetch('/fastStyle_createOutput', {
      method: 'POST'
    })
      .catch((error) => {
        console.error(error);
      });
  }

  async callAPI_Preview(event){
    console.log(event);
    const myStorage = window.localStorage;
  
    fetch('/fastStyle_createOutput', {
      method: 'POST'
    }).then((response) => response.json())
    .then(this.setState({
      preview: "/fast/output.jpg"
    })).then(this.handleImageUpload)
      .catch((error) => {
        console.error(error);
      })

      //Add some sort of timer please

      //const myStorage = window.localStorage;
      const imgurl = myStorage.currentPath;
      console.log(imgurl);
      //console.log(OutputImage);
      
      
  }
  
  previewClicked() {
    const myStorage = window.localStorage;
    const imgurl = myStorage.currentPath;
    this.setState({preview: imgurl});
  }

  toProfile(){
    window.location.href = '/profile';
  }
  
  
  render() {
    let previewImg;
    if(this.state.preview !== ''){
      previewImg = <img src={this.state.preview} alt="preview" style={{height:"100px", width:"100px"}}></img>
    }else{
      previewImg = <p></p>
    }
    
    return (
    <div>
      <div className="upl-share-form" id="image-form">
        <i className="upl-header-icon far fa-image fa-3x"></i>
        <h2 className="card-title mt-3 text-center" style={{fontWeight: "bold"}}>Welcome to the Fast-Styles API!</h2>
        <div>        
            <div style={{margin:"40px 60px 0"}}>
              <p>Just choose any two photos to get a truly artistic result.</p>
                <form encType="multipart/form-data" action="/upload/image" method="post">
                    <p>-----------------------------------</p>
                    <h3>Choose a Main photo</h3>
                    <input id="imageUploaderMain" type="file" onChange={this.handleMain}/>
                    <br /><br />
                    <h3>Choose a Style photo</h3>
                    <input id="imageUploaderStyle" type="file" onChange={this.handleStyle}/>
                </form>
            </div>
            <br />
            <br />
            {previewImg}

            {/*
            <textarea value={this.state.text} onChange={this.handleTextChange} 
              placeholder=" Say something about photo!" className="photo-text"/>
    */} 

            
            <div className="form-group">
                <button type="button" id="preview-btn" className="btn upl-btn btn-info btn-block" onClick={this.callAPI_Preview}> Generate preview! </button>
            </div> 
            
            <div className="form-group">
                <button type="submit" id="submit-btn" className="btn upl-btn btn-success btn-block" onClick={this.sharePostSubmit}> Post Image </button>
            </div>
                      
        </div>        
        <button type="button" id="upload-to-profile" className="btn upl-btn btn-warning btn-block" onClick={this.toProfile}> Back To Profile </button>
      </div> 
    </div>
    );
  }
}

export default Upload;