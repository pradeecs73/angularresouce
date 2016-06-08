'use strict';

module.exports = {
  send_schedulemail: function(mailOptions) {
    mailOptions.html = [
      'Hi<br>',
      'Your cron schedule for rooms has been failed today<br>',
      'Thanks and Regards',
      'MyMatchbox'
    ].join('<br><br>');
    mailOptions.subject = 'Cron failur mail for creating room schedule.';
    mailOptions.createTextFromHtml= true;
    return mailOptions;
  },
  send_editroomscheduleemail: function(mailOptions) {
    mailOptions.html = [
      'Hi<br>',
      'schedule has been updated<br>',
      'RoomId:'+mailOptions.roomId+'<br>',
      'RoomName:'+mailOptions.editedRoomName+'<br>',
      'Thanks and Regards',
      'MyMatchbox'
    ].join('<br><br>');
    mailOptions.subject = 'Schedule Updated mail';
    mailOptions.createTextFromHtml= true;
    return mailOptions;
  }
};
