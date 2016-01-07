'use strict';
/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(Jobs, app, auth, database) {
    var jobslists = require('../controllers/jobs')(Jobs, app);
    app.get('/api/jobs/example/anyone', function(req, res, next) {
        res.send('Anyone can access this');
    });
    app.get('/api/jobs/example/auth', auth.requiresLogin, function(req, res, next) {
        res.send('Only authenticated users can access this');
    });
    app.get('/api/jobs/example/admin', auth.requiresAdmin, function(req, res, next) {
        res.send('Only users with Admin role can access this');
    });
    app.get('/api/jobs/example/render', function(req, res, next) {
        Jobs.render('index', {
            package: 'jobs'
        }, function(err, html) {
            //Rendering a view from the Package server/views
            res.send(html);
        });
    });
    app.route('/api/addjobs').get(jobslists.addjobs);
    app.route('/api/jobs/pagination').get(jobslists.jobListByPagination);
    app.route('/api/jobs', auth.requiresLogin).get(jobslists.displayjobs);
    app.route('/api/jobs/:jobId', auth.requiresLogin).get(jobslists.singlejobdetail);
    app.route('/api/recommendedjobs/pagination', auth.requiresLogin).get(jobslists.recommendedjobListByPagination);
    app.route('/api/recommendedjobs/checked', auth.requiresLogin).get(jobslists.listingloginuserskills);
    app.param('jobId', jobslists.job);
};