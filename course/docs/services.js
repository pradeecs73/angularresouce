'use strict';

exports.load = function(swagger, parms) {

  var searchParms = parms.searchableOptions;

  var list = {
    'spec': {
      description: 'Course operations',
      path: '/course',
      method: 'GET',
      summary: 'Get all Courses',
      notes: 'API to get all courses.',
      type: 'Course',
      nickname: 'getCourses',
      produces: ['application/json'],
      params: searchParms
    }
  };

  var create = {
    'spec': {
      description: 'Create Course Operation',
      path: '/course',
      method: 'POST',
      summary: 'Create course',
      notes: 'API to create a course.',
      type: 'Course',
      nickname: 'createCourse',
      produces: ['application/json'],
      parameters: [{
        name: 'body',
        description: 'Article to create.  User will be inferred by the authenticated user.',
        required: true,
        type: 'Course',
        paramType: 'body',
        allowMultiple: false
      }]
    }
  };

  swagger.addGet(list)
    .addPost(create);

};
