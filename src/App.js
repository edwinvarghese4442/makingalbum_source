import './App.css';
import React,  {Component} from 'react';
import axios from 'axios';
import { ChromePicker } from 'react-color';

import { NavLink } from 'react-router-dom';
import Cookies from 'universal-cookie';



class App extends Component {
  
  
  componentDidMount() {
    // call api or anything
    // console.log("Cookie check");
    // console.log('onload')
            const cookies = new Cookies();
            // console.log(cookies.get('cookieConsent', 'if'));
            if (cookies.get('cookieConsent') === 'Yes'){
              this.setState({cookieOpacity: 0})
              this.setState({cookiePEnone: 'None'})
              // console.log(cookies.get('cookieConsent', 'if'));

            }
            else{
              // console.log(cookies.get('cookieConsent', 'else'));
              this.setState({cookieOpacity: 1})
           }}
  
  constructor() {
    super()

    this.downloadFile = this.downloadFile.bind(this)
    this.state.display = 0.0
    this.state.pbar = 0
    this.state.bgc = '#ff2525'
    this.state.pgbg = '#ff2525'
    this.state.statususer = 'waiting for users input'
    this.state.animation = 'none'
    this.state.background = '#FFFFFF'
    
    this.state.mtprogress = 'none'
    this.state.animationupload = 'none'
    this.state.nofiles = 'no file selected'
    this.state.feedbacktop = '158px'

    this.state.displayPalette = 0.0
    this.state.pointerevents = 'none'
    this.state.sendanimate = 'none'
    this.state.signuptext = 'subscribe'
    this.state.emailvalue = ''
    this.emailhandleChange = this.emailhandleChange.bind(this);
    this.uploadProgress = 0
    this.thumbColor = null

    this.state.colorindex = 0;
    this.state.orientIndex = 0;

    this.state.downloadBcss = 'rgb(11, 63, 105)'
    this.state.downloadBnone = 'auto'
    
  }

  state = {
    selectedFile: null,

   }

  fileSelectedHandler = (event) => {

    // assign uploaded file to 'selectedFile' variable (state is being changed now)
    // this.setState({
    //   selectedFile: null
    // })
    // console.log("uploaded file")
    // console.log(event.target.files.length)
    if (event.target.files.length > 25) {
      // console.log("selected more than 30 files")
      this.setState({
          nofiles: 'select only upto 25 images :('
        })
        this.setState({
          thumbColor: 'red'
        })

        this.setState({
          downloadBcss: 'rgb(179 176 176)'
        })
        this.setState({
          downloadBnone: 'none'
        })
        
    }
    else {
      // console.log(event.target.files.length)
      this.setState({
        downloadBcss: 'rgb(11, 63, 105)'
      })
      this.setState({
        downloadBnone: 'auto'
      })

      this.setState({
        thumbColor: 'grey'
      })
    
      // console.log("selected less than 30 files")
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
      }}
    

  downloadFile (data) {
      // console.log(data,"arguments for getting URLs")
      
      
      // console.log(this.state.selectedFile, "file")
      // if 
      if (this.state.selectedFile != null) {
                  let stateq = this
                  function checkQueueAndStart()
                  {
                    // console.log('queue start')
                  // initiate dummy portion of the loader
                  axios.get('https://makingalbum.s3.ap-south-1.amazonaws.com/progress.json').then(response => 
                  {
                  // console.log(response.data['status'], 'queue response')
                    if (response.data['status'] === 'wip')   {
                      stateq.setState({'animation': 'example 20ms infinite'})
                      stateq.setState({'pgbg': '#ff2525'})
                      stateq.setState({display: 1})
                      stateq.setState({pbar: 20})
                      stateq.setState({statususer:'setting up the desk. Hang on! :)'})
                  checkQueueAndStart()}
                  else
                  {
                    // console.log('inluck.....')
                    stateq.setState({'animation': 'example 20ms infinite'})
                    // console.log('inluck.....2')
                    stateq.setState({'pgbg': '#ff2525'})
                    stateq.setState({display: 1})
                    stateq.setState({pbar: 30})
                    stateq.setState({statususer:'starting...'})


                  // get external url path of the final file
                  const payload = {
                    "process_type": "url",
                    "input_extension":data[0],
                    "output_extension": data[1],
                    "size1":stateq.state.rangeval1,
                    "size2":stateq.state.rangeval2,
                    "page_input": stateq.state.pageNumber
                    };
                    // console.log('inluck.....3')
                  axios.post('https://main.makingalbum.com', payload, {timeout: 10000})
                    .then(response => 
                  { 
                    // display the urls along the file path
                    // console.log("display the urls along the file path") 
                    // console.log('waiting')
  
  
                    //upload blob file to s3
                    var uself = stateq
                    // console.log('waiting2')
                    const config = {
                      onUploadProgress: function(progressEvent) {
                        // console.log('waiting3')
                        var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                        // console.log(percentCompleted)
                        
                        uself.setState({uploadProgress: percentCompleted + ' %'})
                      }
                    }
                    // console.log("uploading file to s3",  this.state.selectedFile, typeof(this.state.selectedFile)) 
                    axios.put(response.data.file_upload[0], stateq.state.selectedFile, config)
  
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
                          "color": stateq.state.colorindex,
                          "orientation": stateq.state.orientIndex
                          
                          };

                        var downloadLink = {"downloadLink":response.data.file_download[0]}
                        axios.post('https://main.makingalbum.com', payload)
                        
              
                        // Going to a recursive function
                        var self = stateq
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
                                    // console.log('still processing',i)
                                    self.setState({statususer:json_value['response']})
                                    
                                    setTimeout(
                                      function() {
                                          get()
                                      }
                                      .bind(this),
                                      3000
                                      ); // call recursive function like this inorder to avoid a screen freeze (for eg. you will not be able to do even a right click)

                                  } 
                                  
                                  else if(json_value['status'] === 'error') {
                                    self.setState({pbar: 220, 'bgc': '#178012'}, () => {
                                      self.setState({'animation': 'none'})
                                      self.setState({'pgbg': 'dark red'})})
                                    self.setState({statususer:json_value['response']})
                                  }
                                  else
                                  
                                  {

                                    // console.log(json_value, 'THE CONTENT')
                                    var generated_url = 'https://makingalbum.s3.ap-south-1.amazonaws.com/' + json_value['file_name']
                                    // var generated_url = response.data.file_download[0]
                                    // console.log(generated_url, 'thisssssss')
                                    self.setState({pbar: 220, 'bgc': '#178012'}, () => {
                                            self.setState({'animation': 'none'})
                                            self.setState({'pgbg': '#178012'})})
                                          self.setState({statususer:'Download complete!'})
                                    // console.log(generated_url, 'ssss')
                                    window.open(generated_url,'_self');
                                   
                                  }
                                  

                                });
                              
                                              
                        }
                       
                        get();
                        
                      });
                      
                  }).catch(error => {     
                  console.log(error)
                  this.setState({statususer:'oh dear, I am not able to reach server. please try later'})
                  this.setState({'pgbg': 'red'})
                  this.setState({'animation': 'none'})
                  this.setState({display: 1})
                  this.setState({pbar: 210})
                    });

                  }})}
                  checkQueueAndStart()
                } else{



                  this.setState({animationupload:'example1 1000ms'}, () => {
                    setTimeout(() => { this.setState({animationupload:'none'})}, 1000)});

                } 
           }
           
          handleChangeComplete = (color) => {
            this.setState({ background: color.hex });
            // console.log(this.state.background)
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
            // console.log('sending mail now')
            const payload = {"cx_email": this.state.emailvalue, "process_type": "email"}
            axios.post('https://main.makingalbum.com', payload)
            // console.log('sent')
              
              }
                
          }

          colorSelect = (color) =>{
            if (color === 'white'){this.setState({colorindex: 'white'})}
            if (color === 'green'){this.setState({colorindex: 'green'})}
            if (color === 'pink'){this.setState({colorindex: 'pink'})}
            if (color === 'yellow'){this.setState({colorindex: 'yellow'})}
            if (color === 'blue'){this.setState({colorindex: 'blue'})}
            if (color === 'purple'){this.setState({colorindex: 'purple'})}
            if (color === 'red'){this.setState({colorindex: 'red'})}
            if (color === 'grey'){this.setState({colorindex: 'grey'})}
          }

          orientSelect = (orient) => {

            if (orient === 'landscape'){this.setState({orientIndex: 0})}
            if (orient === 'square'){this.setState({orientIndex: 1})}
          }



          closeCookieBar = () => {
          const cookies = new Cookies();
          cookies.set('cookieConsent', 'Yes', { path: '/', maxAge: 259200000 });
          // console.log(cookies.get('cookieConsent')); 
          this.setState({cookieOpacity: 0})
          this.setState({cookiePEnone: 'None'})}


  render(){
    
  return (
    
    <div className="background" >
      <div className="cookiebar" style = {{opacity:this.state.cookieOpacity, pointerEvents:this.state.cookiePEnone}}> <p>By clicking on 'I understand', you agree to our use of the website cookies</p><p>cookies will help us to show you personalised ads and revenue from these Ads helps us to maintain this website so that you can use it for FREE</p> 
      <button className='cookie_button_yes' onClick={() =>this.closeCookieBar()}>I understand </button>
      <button className='cookie_button_no' onClick={() =>this.closeCookieBar()}><NavLink to="/Privacy" className= 'privacycss'>Learn More</NavLink></button>
    </div>
      
      <h1 className = "title1">FREE 'ready to print' digital photo album</h1>
      <h2 className = "title2">..because it's always better to keep a printed copy of your photos</h2>
      
      <div className = "firstpic"></div> 

      <div className='thumb' style = {{color:this.state.thumbColor}}>
          {this.state.nofiles}
        </div>
      <div className='albumOrient'>
        <button className={this.state.orientIndex === 0 ? 'landB-active': 'landB'} onClick={() =>this.orientSelect('landscape')} >Landscape</button>
        <button className={this.state.orientIndex === 1 ? 'sqB-active': 'sqB'} onClick={() =>this.orientSelect('square')} >   Square  </button>
      </div>
      <div className='colorSelect'>
        <button className={this.state.colorindex === 'white' ? 'cWhite-active': 'cWhite'} onClick={() =>this.colorSelect('white')} ></button>
        <button className={this.state.colorindex === 'green' ? 'cGreen-active': 'cGreen'} onClick={() =>this.colorSelect('green')} ></button>
        <button className={this.state.colorindex === 'pink' ? 'cPink-active': 'cPink'} onClick={() =>this.colorSelect('pink')} ></button>
        <button className={this.state.colorindex === 'yellow' ? 'cYellow-active': 'cYellow'} onClick={() =>this.colorSelect('yellow')} ></button>
        <button className={this.state.colorindex === 'blue' ? 'cBlue-active': 'cBlue'} onClick={() =>this.colorSelect('blue')} ></button>
        <button className={this.state.colorindex === 'purple' ? 'cPur-active': 'cPur'} onClick={() =>this.colorSelect('purple')} ></button>
        <button className={this.state.colorindex === 'red' ? 'cRed-active': 'cRed'} onClick={() =>this.colorSelect('red')} ></button>
        <button className={this.state.colorindex === 'grey' ? 'cGr-active': 'cGr'} onClick={() =>this.colorSelect('grey')} ></button>
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
          <button className = 'downloadButton' style = {{color: this.state.downloadBcss, pointerEvents:  this.state.downloadBnone}} onClick={() =>this.downloadFile(['.zip','.pdf', this.state.background])}>make album</button>
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
        
        <p className='substext'> for receiving exclusive updates, promotions and product launch information that are coming soon! </p>
        <div class = 'email'>
          <p class = 'emailtext'></p>
          <input class = 'emailContent' placeholder = 'your email id' type = 'text' value = {this.state.emailvalue} onChange={this.emailhandleChange}></input>
        </div>

        {/* <textarea placeholder = "your feedback is important to me!" class = 'messageContent'  > </textarea> */}
        
        <button class = 'sendButton' onClick={() =>this.signupButton()} style = {{backgroundColor: this.state.sendanimate}}>{this.state.signuptext}</button>
        
      </div>

      <p className='writeemail'>reach us at hellomakingalbum@gmail.com</p>


      <div className='disclaimers'>
        <NavLink to="/About" className= 'aboutcss'>About us</NavLink>
        <NavLink to="/Privacy" className= 'privacycss'>Cookie and Privacy policy</NavLink>
      </div>

      <p className= 'ty'>happy album making!</p>

    </div>
  );
}
}

export default App;
