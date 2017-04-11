Meteor.startup(function(){
   ChatRooms.allow({
        'insert':function(userId,doc){
            return true;
        },
        'update':function(userId,doc,fieldNames, modifier){
            return true;
        },
        'remove':function(userId,doc){
            return false;
        }
    });
    process.env.MAIL_URL = "smtp://postmaster@sandboxec10ef4a57e140218e8551fbef2e5c8f.mailgun.org:0a552af27cec37e3a4d98acf68ed31af@smtp.mailgun.org:587";

     Email.send({
        to: "rgilbile@officebrain.com",
        from: "rgilbile@officebrain.com",
        subject: "Meteor Email",
        text: "The email content..."
     });

});
YourFileCollection =new FS.Collection('uploads',{
  //stores: [new FS.Store.FileSystem('uploads',{path:'/var/www/html/chatDemo/public/uploads/user/'})]
  stores: [new FS.Store.FileSystem('uploads',{path:'/var/www/html/test/upload/'})]
});
YourFileCollection.allow({
  insert: function (userId, doc) {
    return true;
  },
  update: function (userId, doc) {
    return true;
  },
  remove: function (userId, doc) {
    return true;
  },
  download: function (userId, doc) {
    return true;
  }
});
