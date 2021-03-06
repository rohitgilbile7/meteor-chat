Accounts.ui.config({
   passwordSignupFields: 'USERNAME_AND_EMAIL'
});

Tracker.autorun(function(){
    Meteor.subscribe("chatrooms");
    Meteor.subscribe("onlusers");
});

Template.sidebar.helpers({
    'onlusr':function(){
        return Meteor.users.find({ "status.online": true , _id: {$ne: Meteor.userId()} });
    }
});

Template.sidebar.events({
    'click .user':function(e){
        Session.set('currentId',this._id);
        Session.set('username',this.username);
        var res=ChatRooms.findOne({chatIds:{$all:[this._id,Meteor.userId()]}});
        if(res)
        {
            //already room exists
            Session.set("roomid",res._id);
        }
        else{
            //no room exists
            var newRoom= ChatRooms.insert({chatIds:[this._id , Meteor.userId()],messages:[]});
            Session.set('roomid',newRoom);
        }
        $('.user').removeClass('active');
        $('#' + this._id).addClass('active');
        $('div[class=chat-with]').text($(e.target).attr('class'));
        var avatar = $(e.target).attr('src');
        console.log(avatar);
        $('.chat-header img').attr("src",avatar).show();
      //  $('div[class=chat-avatar]').show();
        var div = $("#chat_area");
  //      div.scrollTop(div.prop('scrollHeight'));
        // console.log('scrollTop' +div);
        setTimeout(function(){div.scrollTop(div.prop('scrollHeight'));},1000);
      //  console.log('calle console');

    }

});

Template.messages.helpers({
    'msgs':function(){
        var result=ChatRooms.findOne({_id:Session.get('roomid')});
        if(result){
          return result.messages;
        }
    }
});

Template.messages.events = {
  'click #sendMessage' : function (event,template) {
      if (Meteor.user())
        {
            var imageSrc = $('#file').text();
            var name = Meteor.user().username;
            var message = document.getElementById('message');
            if(imageSrc == ' '){
              image = 'noimage';
            }
            else{
              image = imageSrc.slice(0, -1);
            }
            if (message.value !== '' || image != 'noimage') {
                var de=ChatRooms.update({"_id":Session.get("roomid")},{$push:{messages:{
                 name: name,
                 text: message.value,
                 image: image,
                 createdAt: Date.now()
                }}});
                document.getElementById('message').value = '';
                message.value = '';
                $('#file').val('');
                $('#imageName').html('');
				       // $('#imagePreview').attr('src','');
				        $('.preview').hide();
		       }
        }
        else
        {
           alert("login to chat");
        }
    },
    'change .file-uploads': function (event, template) {
    //  console.log("uploading...")
  var  src = '';
      FS.Utility.eachFile(event, function (file) {
        console.log("each file...");
        var yourFile = new FS.File(file);
      //  console.log(yourFile);
        YourFileCollection.insert(yourFile, function (err, fileObj) {
        //  console.log("callback for the insert, err: ", err);
          if (!err) {
      //      console.log("inserted without error");
            var src= 'http://172.16.120.85/test/upload/uploads-'+fileObj._id +'-' +fileObj.name();
            var data = imageJson.push(src);
            $('#file').append(src + ",");
          //  $('#imagePreview').attr('src',src);
            $('#imageName').append("<span id="+fileObj._id+">"+ fileObj.name() +" <a href='"+src+"' target='_blank' id="+fileObj._id+" class=''>View</a>   <a href='javascript:void(0)' id="+fileObj._id+" class='deleteImage'>Delete</a> <br/></span> " );
            $('.preview').show();
          }
          else {
            console.log("there was an error", err);
          }
        });
      });
    },
	'click .deleteImage':function(e){
    var id = $(e.target).attr('id');
		//$(e.target).closest('span').remove();
    $('span[id='+id+']').remove();
	},
	'click .sendinEmail': function(e){
		var textToEmail = $(e.target).data('message');
		var messageFrom = $(e.target).closest("a").attr('class');
		var sendMessage = messageFrom + ': '  + textToEmail;
		Meteor.call('sendtextToEmail',sendMessage,function(err, response) {
			if(!err){
				alert('email send successfully!');
			}
		});
	},
	'click .emailConversation': function(e){
		Modal.show("sendConversation", {}, {
			backdrop: 'static'
		});
	},
    'click .copyText':function(e){
    //  var text = $(e.target).closest("p").find('span').text();
      //var text = $(e.target).parent().parent().find(".my-message").text();
      var text = $(e.target).data('message');
      var copyText = document.createElement("input");
      document.body.appendChild(copyText);
//    $(copyText).css('display','none');
      copyText.setAttribute("id", "copyTextId");
      document.getElementById("copyTextId").value = text;
      document.getElementById("copyTextId").select();
      console.log(document.getElementById("copyTextId").select());
      document.execCommand('copy');
      document.body.removeChild(copyText);
      alert('Message copied to clipboard ' + text);
  }
}

Template.registerHelper( 'equals', ( a1, a2 ) => {
  return a1 === a2;
});
Template.registerHelper( 'Imageequals', ( a1 ) => {
  return a1 != 'noimage';
});
Template.registerHelper('timeFormat', ( timestamp ) => {
  if ( timestamp ) {
    let length = timestamp.toString().length;
    if ( length === 10 ) {
      return moment.unix( timestamp ).format( 'MMMM Do, YYYY' );
    } else {
      return moment.unix( timestamp / 1000 ).format( 'MMMM Do, h:mm' );
    }
  }
});
//Template.tags.helpers({
Template.registerHelper('stringToArray', ( input ) => {
    var tagArray = [];
    tagArray = input.split(',');
    return tagArray;
});
// Template.registerHelper('isEmpty',function(item) {
//   return item === '';
// });
// Handlebars.registerHelper("isNull", function(value) {
//   return value === null;
// });
if (Meteor.isClient) {

  var imageJson =new Array();
  Meteor.subscribe("fileUploads");
   Template.body.onRendered(renderCallTemplate);
  // start Video calling
  Meteor.startup(function() {
   Meteor.VideoCallServices.onReceivePhoneCall = function() {
     Modal.show("chatModal", {}, {
       backdrop: 'static'
     });
   }
   Meteor.VideoCallServices.onCallTerminated = function() {
     console.log(this);
     Modal.hide();
   }
   Meteor.VideoCallServices.onCallIgnored = function() {
     Modal.hide();
     alert("call ignored");
   }
   Meteor.VideoCallServices.onWebcamFail = function(error) {
     alert("Please connect webcam", error);
      Modal.hide();
     console.log("Failed to get webcam", error);
   }
   Meteor.VideoCallServices.elementName = "sidebar";
   Meteor.VideoCallServices.STUNTURN = {
     "iceServers": [{
       url: 'stun:stun01.sipphone.com'
     }, {
       url: 'stun:stun.ekiga.net'
     }, {
       url: 'stun:stun.fwdnet.net'
     }, {
       url: 'stun:stun.ideasip.com'
     }, {
       url: 'stun:stun.iptel.org'
     }, {
       url: 'stun:stun.rixtelecom.se'
     }, {
       url: 'stun:stun.schlund.de'
     }, {
       url: 'stun:stun.l.google.com:19302'
     }, {
       url: 'stun:stun1.l.google.com:19302'
     }, {
       url: 'stun:stun2.l.google.com:19302'
     }, {
       url: 'stun:stun3.l.google.com:19302'
     }, {
       url: 'stun:stun4.l.google.com:19302'
     }, {
       url: 'stun:stunserver.org'
     }, {
       url: 'stun:stun.softjoys.com'
     }, {
       url: 'stun:stun.voiparound.com'
     }, {
       url: 'stun:stun.voipbuster.com'
     }, {
       url: 'stun:stun.voipstunt.com'
     }, {
       url: 'stun:stun.voxgratia.org'
     }, {
       url: 'stun:stun.xten.com'
     }, {
       url: 'turn:numb.viagenie.ca',
       credential: 'muazkh',
       username: 'webrtc@live.com'
     }, {
       url: 'turn:192.158.29.39:3478?transport=udp',
       credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
       username: '28224511:1379330808'
     }, {
       url: 'turn:192.158.29.39:3478?transport=tcp',
       credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
       username: '28224511:1379330808'
     }]

   };
   Meteor.VideoCallServices.setRingtone('/nokia.mp3');

 });

 Template.sidebar.events({
 "click #answer": function() {
   Meteor.VideoCallServices.answerCall();
 },
 "click .userIDLink": function(event) {
   Modal.show("chatModal", {
     callee: this._id,
     calleename: this.username,
     isCaller: true
   }, {
     backdrop: 'static',
     keyboard: false
   });

 }
});
//{_id:{$ne:Meteor.userId()}}
Template.sidebar.helpers({
 check(asd) {
   console.log(asd);
 },
 hasUsers() {
   return Meteor.users.find({
     _id: {
       $ne: Meteor.userId()
     },
     "status.online": true
   }).count() > 0;
 },
 getUsers() {
   return Meteor.users.find({
     _id: {
       $ne: Meteor.userId()
     },
     "status.online": true
   });
 },
 getStatus() {
   let callState = Session.get("callState");
   if (callState)
     return callState.message;
 }
})
Template.sidebar.onRendered(function() {
 // Meteor.subscribe("userList");
  Meteor.subscribe("onlusers");


})
Template.chatModal.onCreated(function() {
 Meteor.VideoCallServices.setLocalWebcam("videoChatCallerVideo");
 Meteor.VideoCallServices.setRemoteWebcam("videoChatAnswerVideo");
})
Template.chatModal.onRendered(function() {

 let self = this;
 const receiving = Meteor.VideoCallServices.VideoChatCallLog.findOne({
   $or: [{
     status: "C",
   }, {
     status: "R",
   }],
   callee_id: Meteor.userId()
 });
 if (!receiving)
   Meteor.VideoCallServices.loadLocalWebcam(true, function() {
     console.log("callback");
     Meteor.VideoCallServices.callRemote(self.data.callee)
   });


})
Template.chatModal.onDestroyed(function() {});

Template.chatModal.events({
 "click #answerCall" (event, template) {
   Meteor.VideoCallServices.loadLocalWebcam(false, function() {
     Meteor.VideoCallServices.answerCall();
   });
 },
 "click #ignoreCall" (event, template) {
   Meteor.VideoCallServices.ignoreCall();
   Modal.hide(template);
 },
 "click #closeChat": function(event, template) {
   Meteor.VideoCallServices.callTerminated();
   //Modal.hide(template);
   Modal.hide();
 }
})
Template.chatModal.helpers({
 getCallerName() {
   let callData = Meteor.VideoCallServices.VideoChatCallLog.findOne({
     _id: Session.get("currentPhoneCall")
   });
   return Meteor.users.findOne({
     _id: callData.caller_id
   }).username;
 },
 getStatus() {
   let callState = Session.get("callState");
   if (callState)
     return callState.message;
 },
 incomingPhoneCall() {
   return Meteor.VideoCallServices.VideoChatCallLog.findOne({
     $or: [{
       status: "C",
     }, {
       status: "R",
     }],
     callee_id: Meteor.userId()
   });
 }
})
  // ends video calling

Template.sendConversation.events({
	'click #sendChatConversation':function(event){
		var toEmail = $('#emailTo').val();
  	var result=ChatRooms.findOne({_id:Session.get('roomid')});
        if(result){
          var message = '';
		  //return result.messages;
			for(var k in result.messages) {
				 message += result.messages[k].name +':' +result.messages[k].image + ' ' + result.messages[k].text + '\n';
			}
    	Meteor.call('emailConversation',toEmail,message,function(err, response) {
			Modal.hide();
			if(!err){
				alert('email send successfully!');
			}
			else{
				console.log(err);
			}
    });
        }
	},
	'click .closeSendChat':function(){
		Modal.hide();
	}
});



}

YourFileCollection =new FS.Collection('uploads',{
    // stores: [new FS.Store.FileSystem('uploads',{path:'/var/www/html/chatDemo/public/uploads/user/'})]
    stores: [new FS.Store.FileSystem('uploads',{path:'/var/www/html/test/upload/'})]
});

FS.debug = true;
