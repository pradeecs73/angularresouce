'use strict';

exports.load = function(swagger, parms) {

  var searchParms = parms.searchableOptions;

  var list = {
    'spec': {
      description: 'Branch operations',
      path: '/branchs',
      method: 'GET',
      summary: 'Get all Branchs',
      notes: '',
      type: 'Branch',
      nickname: 'getBranchs',
      produces: ['application/json'],
      params: searchParms
    }
  };

  var create = {
    'spec': {
      description: 'Device operations',
      path: '/branchs',
      method: 'POST',
      summary: 'Create branch',
      notes: '',
      type: 'Branch',
      nickname: 'createBranch',
      produces: ['application/json'],
      parameters: [{
        name: 'body',
        description: 'Branch to create.  User will be inferred by the authenticated user.',
        required: true,
        type: 'Branch',
        paramType: 'body',
        allowMultiple: false
      }]
    }
  };

  swagger.addGet(list)
    .addPost(create);

};
