import React from 'react';
import './stylesheets/common.css';
import './stylesheets/upload.css';

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
  }

  handleImageUpload(event){
    const myStorage = window.localStorage;
    const { files } = event.target;
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
    const imgpath = myStorage.currentPath;
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
        <h2 className="card-title mt-3 text-center" style={{fontWeight: "bold"}}>Share a new image</h2>
        <div>        
            <div style={{margin:"40px 60px 0"}}>
                <form encType="multipart/form-data" action="/upload/image" method="post">
                    <input id="imageUploader" type="file" onChange={this.handleImageUpload}/>
                </form>
            </div>

            <textarea value={this.state.text} onChange={this.handleTextChange} 
              placeholder=" Say something about photo!" className="photo-text"/>

            {previewImg}
               
            <div className="form-group">
                <button type="button" id="preview-btn" className="btn upl-btn btn-info btn-block" onClick={this.previewClicked}> Preview </button>
            </div> 
    
            <div className="form-group">
                <button type="submit" id="submit-btn" className="btn upl-btn btn-success btn-block" onClick={this.sharePostSubmit}> Share </button>
            </div>            
        </div>        
        <button type="button" id="upload-to-profile" className="btn upl-btn btn-warning btn-block" onClick={this.toProfile}> Back To Profile </button>
      </div> 
    </div>
    );
  }
}

export default Upload;