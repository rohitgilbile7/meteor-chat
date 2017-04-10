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
    'click .user':function(){
        Session.set('currentId',this._id);
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
  //      UI.insert(UI.render(Template.input),$( '#page-content-wrapper' ).get(0));
  //      UI.insert(UI.render(Template.messages),$( '#page-content-wrapper' ).get(0));

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
            var name = Meteor.user().username;
            var message = document.getElementById('message');
            var image =  document.getElementById('file');
            if (message.value !== '') {
                var de=ChatRooms.update({"_id":Session.get("roomid")},{$push:{messages:{
                 name: name,
                 text: message.value,
                 image: image.value,
                 createdAt: Date.now()
                }}});
                document.getElementById('message').value = '';
                message.value = '';
                $('#file').val('');
				        $('#imagePreview').attr('src','');
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

      FS.Utility.eachFile(event, function (file) {
        console.log("each file...");
        var yourFile = new FS.File(file);
        console.log(yourFile);
        YourFileCollection.insert(yourFile, function (err, fileObj) {
          console.log("callback for the insert, err: ", err);
          if (!err) {
            console.log("inserted without error");
            var src= 'http://127.0.0.1/test/upload/uploads-'+fileObj._id +'-' +fileObj.name();
			         $('#file').val(src);
			       //  $('#imagePreview').attr('src',src);
            //    $('.preview').show();
          }
          else {
            console.log("there was an error", err);
          }
        });
      });
    },
	'click #DeletePreview':function(){
		$('#file').val('');
		$('#imagePreview').attr('src','');
		$('.preview').hide();

	}
}

Template.registerHelper( 'equals', ( a1, a2 ) => {
  return a1 === a2;
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
if (Meteor.isClient) {
  Meteor.subscribe("fileUploads");
   Template.body.onRendered(renderCallTemplate);
  Template.messages.helpers({
    theFiles: function () {
      return YourFileCollection.find();
    }
  });
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
}

YourFileCollection =new FS.Collection('uploads',{
    // stores: [new FS.Store.FileSystem('uploads',{path:'/var/www/html/chatDemo/public/uploads/user/'})]
    stores: [new FS.Store.FileSystem('uploads',{path:'/var/www/html/test/upload/'})]
});
FS.debug = true;
