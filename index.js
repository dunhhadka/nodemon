const express=require("express");
const app=express();

const server=require('http').createServer(app);

const {Server}=require('socket.io');
const io=new Server(server);

app.set("view engine","ejs");
app.set("views","./views");
app.use(express.static("public"))

app.get("/home",(req,res,next)=>{
     res.render("Home")
})
app.get("/dangky",(req,res,next)=>{
     res.render("Register")
})
var userinit=[];

io.on("connection",(socket)=>{
     console.log(socket.id +" login")
     socket.on("disconnect",()=>{
          console.log(socket.id+" logout")
     })
     socket.on("user",name=>{
          if(userinit.includes(name)){
               socket.emit("server_register_fail")
          }
          else{
               userinit.push(name);
               socket.Username=name;
               socket.emit("success");
               socket.broadcast.emit("register_success",name);
               io.sockets.emit("server-send-list",userinit)
          }
     })
     socket.on("logout",function(){
          userinit=userinit.filter(i=>{
               return i!==socket.Username
          })
          socket.emit("logoutsuccess");
          var data={
               list:userinit,
               name:socket.Username
          }
          socket.broadcast.emit("userlogout",data)
     })
     socket.on("send_mess",(data)=>{
          socket.emit("send_to_sender",{user:socket.Username,mess:data});
          socket.broadcast.emit("send_to_receiver",{user:socket.Username,mess:data})
     })
})

server.listen(3000);