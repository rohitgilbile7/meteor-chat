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
  'click .btn-success' : function (event,template) {
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
                document.getElementById('file').value = '';
                image.value = '';

              }
        }
        else
        {
           alert("login to chat");
        }
    },
    'change .file-uploads': function (event, template) {
      console.log("uploading...")
      FS.Utility.eachFile(event, function (file) {
        console.log("each file...");
        var yourFile = new FS.File(file);
        YourFileCollection.insert(yourFile, function (err, fileObj) {
          console.log("callback for the insert, err: ", err);
          if (!err) {
            console.log("inserted without error");
            var cursor = YourFileCollection.find(fileObj._id);
              console.log(fileObj.url());
            $('#file').val('uploads-'+fileObj._id +'-' +fileObj.name());
          }
          else {
            console.log("there was an error", err);
          }
        });
      });
    }
}

// Template.messages.events = {
//     'click #deleteFileButton ': function (event) {
//       console.log("deleteFile button ", this);
//       YourFileCollection.remove({_id: this._id});
//     },
    // 'change .file-uploads': function (event, template) {
    //   console.log("uploading...")
    //   FS.Utility.eachFile(event, function (file) {
    //     console.log("each file...");
    //     var yourFile = new FS.File(file);
    //     YourFileCollection.insert(yourFile, function (err, fileObj) {
    //       console.log("callback for the insert, err: ", err);
    //       if (!err) {
    //         console.log("inserted without error");
    //       }
    //       else {
    //         console.log("there was an error", err);
    //       }
    //     });
    //   });
    //
    //
    // }

// }

Template.registerHelper( 'equals', ( a1, a2 ) => {
  return a1 === a2;
});


if (Meteor.isClient) {
  Meteor.subscribe("fileUploads");
  Template.messages.helpers({
    theFiles: function () {
      return YourFileCollection.find();
    }
  });

}

YourFileCollection =new FS.Collection('uploads',{
    // stores: [new FS.Store.FileSystem('uploads',{path:'/var/www/html/chatDemo/public/uploads/user/'})]
    stores: [new FS.Store.FileSystem('uploads',{path:'~/uploads/'})]
});

FS.debug = true;
