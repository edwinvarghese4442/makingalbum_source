import './App.css';
import React,  {Component} from 'react';
import axios from 'axios';
import { ChromePicker } from 'react-color';

import { NavLink } from 'react-router-dom';

class App extends Component {


  constructor() {
    super()

    this.downloadFile = this.downloadFile.bind(this)
    this.state.display = 0.0
    this.state.pbar = 0
    this.state.bgc = '#ff2525'
    this.state.pgbg = '#ff2525'
    this.state.statususer = 'waiting for users input'
    this.state.animation = 'example 200ms infinite'
    this.state.background = '#FFFFFF'
    
    this.state.mtprogress = 'none'
    this.state.animationupload = 'none'
    this.state.nofiles = 'no file selected'
    this.state.feedbacktop = '158px'

    this.state.displayPalette = 0.0
    this.state.pointerevents = 'none'
    this.state.sendanimate = 'none'
    this.state.signuptext = 'sign up'
    this.state.emailvalue = ''
    this.emailhandleChange = this.emailhandleChange.bind(this);
    this.uploadProgress = 0
  }

  state = {
    selectedFile: null,

   }

  fileSelectedHandler = (event) => {

    // assign uploaded file to 'selectedFile' variable (state is being changed now)
    this.setState({
      selectedFile: event.target.files
    })
    console.log("uploaded file")
    console.log(event.target.files)
    
    

    // zip the entire user uploaded files and covert it into a blob and keep it ready
    const zip = require('jszip')();
    let files = event.target.files;
    for (let file = 0; file < event.target.files.length; file++) {
                  // Zip file with the file name.
                  zip.file(files[file].name, files[file]);
                } 
    zip.generateAsync({type: "blob"}).then(content => {
      // console.log(content, 'oooo');
      this.setState({
        selectedFile: content
      })


      // saveAs(content, "example.zip");
      });

      if (event.target.files.length>1){
      
        this.setState({
        nofiles: event.target.files.length + ' images selected'
      })
        
    }
      else {
        this.setState({
          nofiles: event.target.files.length + ' image selected'
        })
        }
      }
    

  downloadFile (data) {
      console.log(data,"arguments for getting URLs")
      const payload = {
        "process_type": "url",
        "input_extension":data[0],
        "output_extension": data[1],
        "size1":this.state.rangeval1,
        "size2":this.state.rangeval2,
        "page_input": this.state.pageNumber
        };
      
      console.log(this.state.selectedFile, "file")
      // if 
      if (this.state.selectedFile != null) {

                  // initiate dummy portion of the loader

                  this.setState({'animation': 'example 200ms infinite'})
                  this.setState({'pgbg': '#ff2525'})
                  this.setState({display: 1})
                  this.setState({pbar: 30})
                  this.setState({statususer:'starting...'})


                  // get external url path of the final file
                  axios.post('https://main.makingalbum.com', payload)
                    .then(response => 
                  { 
                    // display the urls along the file path
                    console.log("display the urls along the file path") 
                    console.log(response.data)
  
  
                    //upload blob file to s3
                    var uself = this
                    const config = {
                      onUploadProgress: function(progressEvent) {
                        var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                        console.log(percentCompleted)
                        
                        uself.setState({uploadProgress: percentCompleted + ' %'})
                      }
                    }
                    console.log("uploading file to s3",  this.state.selectedFile, typeof(this.state.selectedFile)) 
                    axios.put(response.data.file_upload[0], this.state.selectedFile, config)
  
                    const blob = new Blob([JSON.stringify({'status':'wip', 'response':'uploading your photos ', 'pbar':80})], { type: 'application/json' });
                    var blob_file = new File([blob], "k.json")
  
                    // pass back a json file with details like wip and percentage
                    
                    axios.put(response.data.json_put[0], blob_file).then(res => 
                      {
                        
                        //call axios async
                        var payload = {
                          "process_type": "pdftoimage",
                          "user_file": response.data.file_upload[1],
                          "outfile_name": response.data.file_download[1],
                          "json_file": response.data.json[1],
                          "color":data[2]
                          };

                        var downloadLink = {"downloadLink":response.data.file_download[0]}
                        axios.post('https://main.makingalbum.com', payload)
                        
              
                        // Going to a recursive function
                        var self = this
                        var i = 0


                        function get() 
                        
                        {
                          self.setState({uploadProgress: ''})
                              
                              axios.get(response.data.json[0]).then(res => 
                                {

                                  var json_value = res.data
                                  if (json_value['status'] === 'wip') 
                                  
                                  {
                                    self.setState({pbar: json_value['pbar'] })
                                    console.log('still processing',i)
                                    self.setState({statususer:json_value['response']})
                                    
                                    setTimeout(
                                      function() {
                                          get()
                                      }
                                      .bind(this),
                                      1000
                                      ); // call recursive function like this inorder to avoid a screen freeze (for eg. you will not be able to do even a right click)

                                  } 
                                  
                                  else 
                                  
                                  {
                                    console.log('file is ready')
                                    axios.get(response.data.file_download[0], {responseType:'arraybuffer'}).then(res => {
                                        
                                        
                                        
                                        // change the animated loading bar state and change the text as well
                                        self.setState({pbar: 220, 'bgc': '#178012'}, () => {
                                          self.setState({'animation': 'none'})
                                          self.setState({'pgbg': '#178012'})})
                                        self.setState({statususer:'downloaded and ready for printing! :)'})
                                        
                                        if (safariBrowserCheck() !== 'safari') 
                                        {
                                          console.log('not safari')
                                          // works for all browsers except iOS safari
                                          window.open(downloadLink["downloadLink"], "_blank")
                                        }

                                        else

                                        {
                                        // works for safari
                                        console.log('safari')
                                        window.location.assign(downloadLink["downloadLink"])
                                        // var out = new Blob([res.data], { type: 'application/pdf' });
                                        // var reader = new FileReader();
                                        // reader.onload = function(e) {
                                        //     window.location.href = reader.result;
                                        // }
                                        // reader.readAsDataURL(out);
                                        // var fileURL = URL.createObjectURL(out);
                                        // var a = document.createElement('a');
                                        // a.href = fileURL;
                                        // a.target = '_blank';
                                        // a.download = 'Ready_to_print_albumz.pdf';
                                        // document.body.appendChild(a);
                                        // a.click();
                                        }
                                        
                                     })
                                    
                                  }
                                  

                                });
                              
                                              
                        }
                        function safariBrowserCheck() {
                        var userAgent = window.navigator.userAgent;
                        console.log(userAgent, "user agent")
                        if (userAgent.match(/iPad/i) || userAgent.match(/iPhone/i)) {
                          console.log('safari')
                          return "safari";
                        }
                        else {
                          console.log('not safari')
                          // Anything else
                            }       }                            
  
                        // this.get.bind(this)
                        
                        
  
                        get();
                        
                      });
                      
                  });
      
  
                } else{



                  this.setState({animationupload:'example1 1000ms'}, () => {
                    setTimeout(() => { this.setState({animationupload:'none'})}, 1000)});

                } 
           }
           
          handleChangeComplete = (color) => {
            this.setState({ background: color.hex });
            console.log(this.state.background)
          }

          emailhandleChange(event) {    
            
            this.setState({emailvalue: event.target.value});  }

          
          signupButton = () => {
            // this.setState({sendanimate:'rgb(148, 206, 148)'})
            // this.setState({signuptext:'Done. Stay tuned!'})
            if (!this.state.emailvalue.includes('@')) {
              this.setState({sendanimate:'#ff8c8c'})
            this.setState({signuptext:'oops. email is invalid'}, () => {
              setTimeout(() => { 
                this.setState({signuptext:'sign up'})
                this.setState({sendanimate:'#65a7e5'})}, 500)})
            
            

            }
            else{
            this.setState({sendanimate:'rgb(148, 206, 148)'})
            this.setState({emailvalue: ''})
            this.setState({signuptext:'Welcome and Stay tuned!'}, () => {
              setTimeout(() => { 
                this.setState({signuptext:'sign up'})
                this.setState({sendanimate:'#65a7e5'})}, 3000)});
            console.log('sending mail now')
            const payload = {"email": this.state.emailvalue}
            axios.post('https://main.makingalbum.com', payload)
            console.log('sent')
              
              }
                
          }
          
          
          

  render(){
  return (
    
    <div className="background">
      
      <h1 className = "title1">FREE 'ready to print' digital photo album</h1>
      <h2 className = "title2">..because it's always better to keep a printed copy of your photos</h2>
      
      <div className = "firstpic"></div> 


      
      
      <div className='thumb'>
          {this.state.nofiles}
        </div>


      <div className = 'button-fam'>
        <div>
          <input style={{display:'none'}}
          type = "file"
          onChange={this.fileSelectedHandler} multiple
          ref={fileInput => this.fileInput = fileInput}/>
          <button className = 'uploadButton' onClick={() => this.fileInput.click()} style = {{animation:this.state.animationupload}}>select photos</button>
          
        </div>

        
      
        <div>
          <button className = 'downloadButton' onClick={() =>this.downloadFile(['.zip','.pdf', this.state.background])}>make album</button>
        </div>
      </div>



      <div  className='colorpalette' style = {{opacity:this.state.displayPalette, pointerEvents:this.state.pointerevents}}>
        <button className='cCloseButton' onClick={() =>this.openColorPalette()}>
          close
        </button>
        <div>
          <ChromePicker 
            color={this.state.background }
            onChangeComplete={ this.handleChangeComplete }
          />
        </div>
      </div>
      


      <div className = 'progressBg' style = {{opacity: this.state.display}}>
        <div className = "progress" style = {{opacity:this.state.display, width:this.state.pbar, background:this.state.pgbg, animation:this.state.animation}}>
          {/* <div className = "progress-done" style={{background:this.state.bgc}}> </div> */}
        </div>
      </div>


      <div className='statususer' style = {{opacity: this.state.display}}>
        <p> {this.state.statususer} {this.state.uploadProgress}</p>
      </div>


      <div className = 'feedback'>
        
        <p className='substext'> for exclusive updates, promotions and product launch information that are coming soon! </p>
        <div class = 'email'>
          <p class = 'emailtext'></p>
          <input class = 'emailContent' placeholder = 'your email id' type = 'text' value = {this.state.emailvalue} onChange={this.emailhandleChange}></input>
        </div>

        {/* <textarea placeholder = "your feedback is important to me!" class = 'messageContent'  > </textarea> */}
        
        <button class = 'sendButton' onClick={() =>this.signupButton()} style = {{backgroundColor: this.state.sendanimate}}>{this.state.signuptext}</button>
        
      </div>

      <p className='writeemail'>reach us at hello@makingalbum.com</p>


      <div className='disclaimers'>
        <NavLink to="/About" className= 'aboutcss'>About us</NavLink>
        <NavLink to="/Privacy" className= 'privacycss'>Privacy policy</NavLink>
        <NavLink to="/Terms" className= 'termscss'>Terms of use</NavLink>
      </div>

      <p className= 'ty'>happy album making!</p>

    </div>
  );
}
}

export default App;
